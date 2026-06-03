from pydantic import BaseModel, EmailStr
from typing import Optional


# ── Auth ──

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "lecturer"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: str


# ── Student ──

class StudentCreate(BaseModel):
    matric_no: str
    first_name: str
    last_name: str
    email: str
    department: str
    level: int
    enrollment_year: int


class StudentUpdate(BaseModel):
    matric_no: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    level: Optional[int] = None
    enrollment_year: Optional[int] = None


class StudentResponse(BaseModel):
    id: int
    matric_no: str
    first_name: str
    last_name: str
    email: str
    department: str
    level: int
    enrollment_year: int
    created_at: str
    record_count: int = 0
    average_score: float = 0.0
    latest_prediction: Optional[str] = None


# ── Course ──

class CourseCreate(BaseModel):
    code: str
    name: str
    department: str
    level: int
    credit_units: int = 3


class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    department: Optional[str] = None
    level: Optional[int] = None
    credit_units: Optional[int] = None


class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    department: str
    level: int
    credit_units: int
    created_at: str


# ── Academic Record ──

class AcademicRecordCreate(BaseModel):
    student_id: int
    course_id: int
    attendance_score: float = 0
    assignment_score: float = 0
    ca_score: float = 0
    exam_score: float = 0
    semester: str
    academic_year: str


class AcademicRecordUpdate(BaseModel):
    attendance_score: Optional[float] = None
    assignment_score: Optional[float] = None
    ca_score: Optional[float] = None
    exam_score: Optional[float] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None


class AcademicRecordResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    attendance_score: float
    assignment_score: float
    ca_score: float
    exam_score: float
    total_score: float
    grade: str
    semester: str
    academic_year: str
    created_at: str
    student_name: str = ""
    course_name: str = ""


# ── Prediction ──

class PredictionResponse(BaseModel):
    id: int
    student_id: int
    predicted_grade: str
    confidence: float
    probability_scores: str
    features_used: str
    recommendations: str
    model_version: str
    created_at: str
    student_name: str = ""


class PredictionResult(BaseModel):
    student_id: int
    student_name: str
    predicted_grade: str
    confidence: float
    probability_scores: dict
    features_used: dict
    recommendations: str


class ModelMetricsResponse(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_samples: int
    features: list[str]
    trained_at: str


# ── Dashboard Stats ──

class DashboardStats(BaseModel):
    total_students: int
    total_courses: int
    total_records: int
    total_predictions: int
    at_risk_count: int
    grade_distribution: dict
    recent_predictions: list[PredictionResponse]
