from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import User, Student, Course, AcademicRecord, compute_total, compute_grade
from schemas import AcademicRecordCreate, AcademicRecordUpdate, AcademicRecordResponse
from auth import get_current_user

router = APIRouter(prefix="/api/records", tags=["records"])


@router.get("", response_model=list[AcademicRecordResponse])
def list_records(
    student_id: int = Query(default=None),
    course_id: int = Query(default=None),
    semester: str = Query(default=""),
    academic_year: str = Query(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(AcademicRecord)
    if student_id:
        q = q.filter(AcademicRecord.student_id == student_id)
    if course_id:
        q = q.filter(AcademicRecord.course_id == course_id)
    if semester:
        q = q.filter(AcademicRecord.semester == semester)
    if academic_year:
        q = q.filter(AcademicRecord.academic_year == academic_year)

    records = q.order_by(AcademicRecord.created_at.desc()).limit(500).all()
    return [_to_response(r, db) for r in records]


@router.post("", response_model=AcademicRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    body: AcademicRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == body.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    course = db.query(Course).filter(Course.id == body.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    total = compute_total(body.attendance_score, body.assignment_score, body.ca_score, body.exam_score)
    grade = compute_grade(total)

    record = AcademicRecord(
        **body.model_dump(),
        total_score=total,
        grade=grade,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_response(record, db)


@router.get("/{record_id}", response_model=AcademicRecordResponse)
def get_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return _to_response(record, db)


@router.put("/{record_id}", response_model=AcademicRecordResponse)
def update_record(
    record_id: int,
    body: AcademicRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(record, key, val)

    total = compute_total(record.attendance_score, record.assignment_score, record.ca_score, record.exam_score)
    record.total_score = total
    record.grade = compute_grade(total)

    db.commit()
    db.refresh(record)
    return _to_response(record, db)


@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"success": True}


def _to_response(record: AcademicRecord, db: Session) -> dict:
    student = db.query(Student).filter(Student.id == record.student_id).first()
    course = db.query(Course).filter(Course.id == record.course_id).first()
    return {
        "id": record.id,
        "student_id": record.student_id,
        "course_id": record.course_id,
        "attendance_score": record.attendance_score,
        "assignment_score": record.assignment_score,
        "ca_score": record.ca_score,
        "exam_score": record.exam_score,
        "total_score": record.total_score,
        "grade": record.grade,
        "semester": record.semester,
        "academic_year": record.academic_year,
        "created_at": record.created_at,
        "student_name": f"{student.first_name} {student.last_name}" if student else "Unknown",
        "course_name": course.name if course else "Unknown",
    }
