# Build Plan — Student Academic Performance Prediction System (SAPPS)

Generated: 2026-06-03
Mode: greenfield
Type: fullstack
Stack: Python FastAPI (backend) + Next.js 15 App Router (frontend) + SQLite + scikit-learn

## Project Summary
Design and Implementation of a Machine Learning Model for Predicting Student Academic Performance.
Final year project for FAMUDITI BABATOMIWA ABDUL HAMID (Matric: 220303010117).
Lagos State University of Science and Technology (LASUSTECH), Department of Computer Science.

## Stack Decisions
- **Python FastAPI**: ML model training and prediction requires Python (scikit-learn). FastAPI is modern, async-capable, and auto-generates OpenAPI docs.
- **Next.js 15 App Router**: Matches other final-year project patterns; gives RSC + server components + modern React.
- **Tailwind CSS + shadcn/ui**: Consistent with other LASUSTECH final-year projects; accessible component primitives.
- **SQLite via SQLAlchemy**: Zero-config local database; no external BaaS dependency (no mudbase per instruction).
- **scikit-learn**: Industry-standard ML library; Random Forest classifier for student performance prediction.
- **Recharts**: Charting library matching ade-final-year-project pattern.
- **lucide-react**: Icon library matching other projects.

## Feature Scope
1. **Authentication**
   - User registration (name, email, password)
   - User login (JWT-based)
   - Role-based access (admin, lecturer)
   - Protected routes

2. **Student Management**
   - Add student (matric number, name, email, department, level)
   - Edit student details
   - Delete student
   - List/search students
   - View student detail with academic history

3. **Course Management**
   - Add course (code, name, department, level, credit units)
   - List courses
   - Edit/delete courses

4. **Academic Records**
   - Add academic record (student, course, attendance, assignment, CA, exam scores)
   - Auto-calculate total score and grade
   - Edit records
   - View records by student or course
   - Filter by semester/academic year

5. **ML Prediction Engine**
   - Train model on historical academic records
   - Predict individual student performance
   - Batch prediction for all students
   - Show model metrics (accuracy, precision, recall, F1-score)
   - Feature importance visualization
   - Recommendations based on prediction

6. **Dashboard**
   - Total students, courses, records count
   - Grade distribution chart (pie)
   - Performance trend chart (bar)
   - At-risk students count
   - Recent predictions

7. **Reports**
   - Grade distribution by department
   - Performance trends by semester
   - At-risk students report
   - Model performance report

## Data Models

### User
  - id: INTEGER PK
  - email: TEXT UNIQUE
  - password_hash: TEXT
  - name: TEXT
  - role: TEXT ('admin' | 'lecturer')
  - created_at: TEXT (ISO)

### Student
  - id: INTEGER PK
  - matric_no: TEXT UNIQUE
  - first_name: TEXT
  - last_name: TEXT
  - email: TEXT
  - department: TEXT
  - level: INTEGER
  - enrollment_year: INTEGER
  - created_at: TEXT (ISO)

### Course
  - id: INTEGER PK
  - code: TEXT UNIQUE
  - name: TEXT
  - department: TEXT
  - level: INTEGER
  - credit_units: INTEGER
  - created_at: TEXT (ISO)

### AcademicRecord
  - id: INTEGER PK
  - student_id: INTEGER FK → Student
  - course_id: INTEGER FK → Course
  - attendance_score: REAL (0-100)
  - assignment_score: REAL (0-100)
  - ca_score: REAL (0-100)
  - exam_score: REAL (0-100)
  - total_score: REAL (computed)
  - grade: TEXT (computed: A/B/C/D/F)
  - semester: TEXT ('first' | 'second')
  - academic_year: TEXT ('2025/2026')
  - created_at: TEXT (ISO)

### Prediction
  - id: INTEGER PK
  - student_id: INTEGER FK → Student
  - predicted_grade: TEXT
  - confidence: REAL
  - probability_scores: TEXT (JSON)
  - features_used: TEXT (JSON)
  - recommendations: TEXT
  - model_version: TEXT
  - created_at: TEXT (ISO)

## API Endpoints

### Auth
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET  | /api/auth/me | Current user info |

### Students
| GET    | /api/students | List students (search, department filter) |
| POST   | /api/students | Add student |
| GET    | /api/students/{id} | Get student + academic summary |
| PUT    | /api/students/{id} | Update student |
| DELETE | /api/students/{id} | Delete student |

### Courses
| GET    | /api/courses | List courses |
| POST   | /api/courses | Add course |
| PUT    | /api/courses/{id} | Update course |
| DELETE | /api/courses/{id} | Delete course |

### Academic Records
| GET    | /api/records | List records (student_id, course_id, semester filters) |
| POST   | /api/records | Add record |
| GET    | /api/records/{id} | Get record detail |
| PUT    | /api/records/{id} | Update record |
| DELETE | /api/records/{id} | Delete record |

### Predictions
| GET  | /api/predictions | List prediction history |
| POST | /api/predictions/train | Train ML model on current data |
| POST | /api/predictions/predict/{student_id} | Predict for one student |
| POST | /api/predictions/predict-batch | Predict for all students |
| GET  | /api/predictions/{id} | Get prediction detail |
| GET  | /api/predictions/model-metrics | Get latest model performance metrics |

### Stats
| GET | /api/stats/dashboard | Dashboard metrics |
| GET | /api/stats/reports | Report data |

## UI Pages

### /login — Login
Email/password form. Redirects to /dashboard if authenticated.

### /register — Register
Name, email, password, role selector. First user gets admin role.

### /dashboard — Dashboard
Metric cards (students, records, predictions, at-risk), grade distribution pie chart, performance trend bar chart, recent predictions table.

### /students — Student List
Searchable/filterable table of students. Add new button. Click to view detail.

### /students/new — Add Student
Form: matric number, first/last name, email, department, level, enrollment year.

### /students/[id] — Student Detail
Student info card + academic records table + prediction history + performance chart.

### /records — Academic Records
Filterable table (by student, course, semester). Add new button.

### /records/new — Add Record
Form: select student, select course, enter scores (attendance, assignment, CA, exam). Auto-calculates total and grade.

### /records/[id] — Record Detail
Record info with grade badge.

### /predictions — Prediction History
Table of past predictions with grades, confidence, dates.

### /predictions/new — Run Prediction
Select student, view current academic data, run prediction, see results with recommendations.

### /reports — Reports & Analytics
Grade distribution charts, performance trends, at-risk student list, model metrics.

### /courses — Course Management
List courses, add/edit/delete.

## Environment Variables
```
JWT_SECRET_KEY=change-me-in-production-use-random-64-chars
DATABASE_URL=sqlite:///./sapps.db
```
(No NEXT_PUBLIC_ vars needed — frontend proxies through Next.js API routes, but we call backend directly for simplicity.)

## Architecture Notes
- Backend runs on port 8000 (uvicorn)
- Frontend runs on port 3000 (next dev)
- Frontend makes direct API calls to backend (CORS enabled)
- SQLite database auto-created on first run
- ML model auto-trains when sufficient data exists
- Seed data script available for demo purposes
