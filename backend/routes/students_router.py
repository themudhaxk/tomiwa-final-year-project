from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import User, Student, AcademicRecord, Prediction
from schemas import StudentCreate, StudentUpdate, StudentResponse
from auth import get_current_user

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("", response_model=list[StudentResponse])
def list_students(
    search: str = Query(default=""),
    department: str = Query(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Student)
    if search:
        q = q.filter(
            (Student.first_name + " " + Student.last_name).ilike(f"%{search}%")
            | Student.matric_no.ilike(f"%{search}%")
        )
    if department:
        q = q.filter(Student.department.ilike(f"%{department}%"))
    students = q.order_by(Student.created_at.desc()).all()

    result = []
    for s in students:
        record_count = db.query(AcademicRecord).filter(AcademicRecord.student_id == s.id).count()
        avg_row = db.query(func.avg(AcademicRecord.total_score)).filter(
            AcademicRecord.student_id == s.id
        ).scalar()
        avg_score = round(float(avg_row), 1) if avg_row else 0.0
        latest = (
            db.query(Prediction)
            .filter(Prediction.student_id == s.id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        result.append({
            "id": s.id,
            "matric_no": s.matric_no,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email,
            "department": s.department,
            "level": s.level,
            "enrollment_year": s.enrollment_year,
            "created_at": s.created_at,
            "record_count": record_count,
            "average_score": avg_score,
            "latest_prediction": latest.predicted_grade if latest else None,
        })
    return result


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    body: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Student).filter(Student.matric_no == body.matric_no).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Matric number already exists")
    student = Student(**body.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return _to_response(student, db)


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return _to_response(student, db)


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    body: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(student, key, val)
    db.commit()
    db.refresh(student)
    return _to_response(student, db)


@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"success": True}


def _to_response(student: Student, db: Session) -> dict:
    record_count = db.query(AcademicRecord).filter(AcademicRecord.student_id == student.id).count()
    avg_row = db.query(func.avg(AcademicRecord.total_score)).filter(
        AcademicRecord.student_id == student.id
    ).scalar()
    avg_score = round(float(avg_row), 1) if avg_row else 0.0
    latest = (
        db.query(Prediction)
        .filter(Prediction.student_id == student.id)
        .order_by(Prediction.created_at.desc())
        .first()
    )
    return {
        "id": student.id,
        "matric_no": student.matric_no,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "department": student.department,
        "level": student.level,
        "enrollment_year": student.enrollment_year,
        "created_at": student.created_at,
        "record_count": record_count,
        "average_score": avg_score,
        "latest_prediction": latest.predicted_grade if latest else None,
    }
