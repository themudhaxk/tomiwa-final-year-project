import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import User, Student, AcademicRecord, Prediction
from schemas import PredictionResponse, PredictionResult, ModelMetricsResponse
from auth import get_current_user
from ml import ModelTrainer, ModelPredictor

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


def _avg_features(records) -> dict:
    """Aggregate student records into average feature values."""
    if not records:
        return {"attendance_score": 0, "assignment_score": 0, "ca_score": 0, "exam_score": 0}
    n = len(records)
    return {
        "attendance_score": round(sum(r.attendance_score for r in records) / n, 1),
        "assignment_score": round(sum(r.assignment_score for r in records) / n, 1),
        "ca_score": round(sum(r.ca_score for r in records) / n, 1),
        "exam_score": round(sum(r.exam_score for r in records) / n, 1),
    }


@router.get("", response_model=list[PredictionResponse])
def list_predictions(
    student_id: int = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Prediction)
    if student_id:
        q = q.filter(Prediction.student_id == student_id)
    predictions = q.order_by(Prediction.created_at.desc()).limit(200).all()
    return [_to_response(p, db) for p in predictions]


@router.post("/train")
def train_model(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = db.query(AcademicRecord).all()
    if len(records) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient data. Need at least 10 academic records, found {len(records)}.",
        )

    data = [
        {
            "attendance_score": r.attendance_score,
            "assignment_score": r.assignment_score,
            "ca_score": r.ca_score,
            "exam_score": r.exam_score,
            "grade": r.grade,
        }
        for r in records
    ]

    trainer = ModelTrainer()
    metrics = trainer.train(data)
    return {"success": True, "metrics": metrics}


@router.post("/predict/{student_id}")
def predict_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    trainer = ModelTrainer.load()
    if trainer is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No trained model found. Train the model first via POST /api/predictions/train",
        )

    records = db.query(AcademicRecord).filter(AcademicRecord.student_id == student_id).all()
    features = _avg_features(records)

    predictor = ModelPredictor(trainer)
    result = predictor.predict(features)

    prediction = Prediction(
        student_id=student_id,
        predicted_grade=result["predicted_grade"],
        confidence=result["confidence"],
        probability_scores=json.dumps(result["probability_scores"]),
        features_used=json.dumps(result["features_used"]),
        recommendations=result["recommendations"],
        model_version="1.0",
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return {
        "id": prediction.id,
        "student_id": prediction.student_id,
        "student_name": f"{student.first_name} {student.last_name}",
        "predicted_grade": prediction.predicted_grade,
        "confidence": prediction.confidence,
        "probability_scores": result["probability_scores"],
        "features_used": result["features_used"],
        "recommendations": prediction.recommendations,
        "model_version": prediction.model_version,
        "created_at": prediction.created_at,
    }


@router.post("/predict-batch")
def predict_batch(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trainer = ModelTrainer.load()
    if trainer is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No trained model found. Train the model first via POST /api/predictions/train",
        )

    predictor = ModelPredictor(trainer)
    students = db.query(Student).all()
    results = []

    for student in students:
        records = db.query(AcademicRecord).filter(AcademicRecord.student_id == student.id).all()
        features = _avg_features(records)
        result = predictor.predict(features)

        prediction = Prediction(
            student_id=student.id,
            predicted_grade=result["predicted_grade"],
            confidence=result["confidence"],
            probability_scores=json.dumps(result["probability_scores"]),
            features_used=json.dumps(result["features_used"]),
            recommendations=result["recommendations"],
            model_version="1.0",
        )
        db.add(prediction)
        results.append({
            "student_id": student.id,
            "student_name": f"{student.first_name} {student.last_name}",
            "predicted_grade": result["predicted_grade"],
            "confidence": result["confidence"],
            "recommendations": result["recommendations"],
        })

    db.commit()
    return {"predictions": results, "count": len(results)}


@router.get("/model-metrics")
def get_model_metrics(current_user: User = Depends(get_current_user)):
    metrics = ModelTrainer.get_saved_metrics()
    if metrics is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No trained model metrics found")
    return metrics


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return _to_response(prediction, db)


def _to_response(prediction: Prediction, db: Session) -> dict:
    student = db.query(Student).filter(Student.id == prediction.student_id).first()
    return {
        "id": prediction.id,
        "student_id": prediction.student_id,
        "predicted_grade": prediction.predicted_grade,
        "confidence": prediction.confidence,
        "probability_scores": prediction.probability_scores,
        "features_used": prediction.features_used,
        "recommendations": prediction.recommendations,
        "model_version": prediction.model_version,
        "created_at": prediction.created_at,
        "student_name": f"{student.first_name} {student.last_name}" if student else "Unknown",
    }
