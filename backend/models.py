from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


def utcnow():
    return datetime.now(timezone.utc).isoformat()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="lecturer")  # admin | lecturer
    created_at = Column(String, default=utcnow)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    matric_no = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    department = Column(String, nullable=False)
    level = Column(Integer, nullable=False)
    enrollment_year = Column(Integer, nullable=False)
    created_at = Column(String, default=utcnow)

    records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="student", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    level = Column(Integer, nullable=False)
    credit_units = Column(Integer, default=3)
    created_at = Column(String, default=utcnow)

    records = relationship("AcademicRecord", back_populates="course")


class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    attendance_score = Column(Float, nullable=False, default=0)  # 0-100
    assignment_score = Column(Float, nullable=False, default=0)  # 0-100
    ca_score = Column(Float, nullable=False, default=0)           # 0-100
    exam_score = Column(Float, nullable=False, default=0)         # 0-100
    total_score = Column(Float, nullable=False, default=0)
    grade = Column(String, nullable=False, default="F")
    semester = Column(String, nullable=False)   # first | second
    academic_year = Column(String, nullable=False)  # 2025/2026
    created_at = Column(String, default=utcnow)

    student = relationship("Student", back_populates="records")
    course = relationship("Course", back_populates="records")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    predicted_grade = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    probability_scores = Column(Text, nullable=False, default="{}")   # JSON string
    features_used = Column(Text, nullable=False, default="{}")        # JSON string
    recommendations = Column(Text, nullable=False, default="")
    model_version = Column(String, nullable=False, default="1.0")
    created_at = Column(String, default=utcnow)

    student = relationship("Student", back_populates="predictions")


def compute_grade(total: float) -> str:
    if total >= 70:
        return "A"
    elif total >= 60:
        return "B"
    elif total >= 50:
        return "C"
    elif total >= 45:
        return "D"
    else:
        return "F"


def compute_total(attendance: float, assignment: float, ca: float, exam: float) -> float:
    """Weighted total: attendance 10%, assignment 10%, CA 10%, exam 70%"""
    return round(attendance * 0.10 + assignment * 0.10 + ca * 0.10 + exam * 0.70, 2)
