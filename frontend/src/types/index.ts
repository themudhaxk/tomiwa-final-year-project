export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "lecturer";
  created_at: string;
}

export interface Student {
  id: number;
  matric_no: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  level: number;
  enrollment_year: number;
  created_at: string;
  record_count: number;
  average_score: number;
  latest_prediction: string | null;
}

export interface StudentCreate {
  matric_no: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  level: number;
  enrollment_year: number;
}

export interface StudentUpdate {
  matric_no?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  level?: number;
  enrollment_year?: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  level: number;
  credit_units: number;
  created_at: string;
}

export interface CourseCreate {
  code: string;
  name: string;
  department: string;
  level: number;
  credit_units: number;
}

export interface AcademicRecord {
  id: number;
  student_id: number;
  course_id: number;
  attendance_score: number;
  assignment_score: number;
  ca_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  semester: string;
  academic_year: string;
  created_at: string;
  student_name: string;
  course_name: string;
}

export interface AcademicRecordCreate {
  student_id: number;
  course_id: number;
  attendance_score: number;
  assignment_score: number;
  ca_score: number;
  exam_score: number;
  semester: string;
  academic_year: string;
}

export interface Prediction {
  id: number;
  student_id: number;
  predicted_grade: string;
  confidence: number;
  probability_scores: string;
  features_used: string;
  recommendations: string;
  model_version: string;
  created_at: string;
  student_name: string;
}

export interface PredictionResult {
  id: number;
  student_id: number;
  student_name: string;
  predicted_grade: string;
  confidence: number;
  probability_scores: Record<string, number>;
  features_used: Record<string, number>;
  recommendations: string;
  model_version: string;
  created_at: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_samples: number;
  test_samples: number;
  features: string[];
  trained_at: string;
  feature_importance: Record<string, number>;
}

export interface DashboardStats {
  total_students: number;
  total_courses: number;
  total_records: number;
  total_predictions: number;
  at_risk_count: number;
  grade_distribution: Record<string, number>;
  recent_predictions: Prediction[];
}

export interface ReportData {
  grade_distribution_by_department: Record<string, Record<string, number>>;
  performance_trends: Array<{
    semester: string;
    academic_year: string;
    average_score: number;
    record_count: number;
  }>;
  at_risk_students: Array<{
    student_id: number;
    name: string;
    matric_no: string;
    department: string;
    average_score: number;
  }>;
  model_metrics: ModelMetrics | null;
}
