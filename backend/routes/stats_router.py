from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import User, Student, AcademicRecord, Prediction, Course
from auth import get_current_user

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/dashboard")
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_students = db.query(Student).count()
    total_courses = db.query(Course).count()
    total_records = db.query(AcademicRecord).count()
    total_predictions = db.query(Prediction).count()

    # At-risk: students whose latest prediction is D or F, or whose average is below 50
    at_risk_count = 0
    students = db.query(Student).all()
    for s in students:
        avg = db.query(func.avg(AcademicRecord.total_score)).filter(
            AcademicRecord.student_id == s.id
        ).scalar()
        if avg and float(avg) < 50:
            at_risk_count += 1

    # Grade distribution
    grades = db.query(AcademicRecord.grade, func.count(AcademicRecord.id)).group_by(
        AcademicRecord.grade
    ).all()
    grade_distribution = {g: c for g, c in grades}

    # Recent predictions
    recent = (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .limit(10)
        .all()
    )
    recent_predictions = []
    for p in recent:
        student = db.query(Student).filter(Student.id == p.student_id).first()
        recent_predictions.append({
            "id": p.id,
            "student_id": p.student_id,
            "predicted_grade": p.predicted_grade,
            "confidence": p.confidence,
            "probability_scores": p.probability_scores,
            "features_used": p.features_used,
            "recommendations": p.recommendations,
            "model_version": p.model_version,
            "created_at": p.created_at,
            "student_name": f"{student.first_name} {student.last_name}" if student else "Unknown",
        })

    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_records": total_records,
        "total_predictions": total_predictions,
        "at_risk_count": at_risk_count,
        "grade_distribution": grade_distribution,
        "recent_predictions": recent_predictions,
    }


@router.get("/reports")
def reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Grade distribution by department
    dept_grades_q = (
        db.query(
            Student.department,
            AcademicRecord.grade,
            func.count(AcademicRecord.id),
        )
        .join(AcademicRecord, AcademicRecord.student_id == Student.id)
        .group_by(Student.department, AcademicRecord.grade)
        .all()
    )
    dept_grades = {}
    for dept, grade, count in dept_grades_q:
        if dept not in dept_grades:
            dept_grades[dept] = {}
        dept_grades[dept][grade] = count

    # Performance trend by semester
    semester_q = (
        db.query(
            AcademicRecord.semester,
            AcademicRecord.academic_year,
            func.avg(AcademicRecord.total_score),
            func.count(AcademicRecord.id),
        )
        .group_by(AcademicRecord.semester, AcademicRecord.academic_year)
        .order_by(AcademicRecord.academic_year, AcademicRecord.semester)
        .all()
    )
    trends = [
        {
            "semester": s,
            "academic_year": y,
            "average_score": round(float(avg), 1),
            "record_count": count,
        }
        for s, y, avg, count in semester_q
    ]

    # At-risk students
    at_risk = []
    students = db.query(Student).all()
    for s in students:
        avg = db.query(func.avg(AcademicRecord.total_score)).filter(
            AcademicRecord.student_id == s.id
        ).scalar()
        avg_val = round(float(avg), 1) if avg else 0.0
        if avg_val < 50:
            at_risk.append({
                "student_id": s.id,
                "name": f"{s.first_name} {s.last_name}",
                "matric_no": s.matric_no,
                "department": s.department,
                "average_score": avg_val,
            })

    # Model metrics
    from ml import ModelTrainer
    model_metrics = ModelTrainer.get_saved_metrics()

    return {
        "grade_distribution_by_department": dept_grades,
        "performance_trends": trends,
        "at_risk_students": at_risk,
        "model_metrics": model_metrics,
    }
