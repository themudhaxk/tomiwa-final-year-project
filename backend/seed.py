"""Seed the database with demo data for testing and demonstration."""
import sys
import os

# Ensure we can import from the backend package
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, init_db
from models import User, Student, Course, AcademicRecord, compute_total, compute_grade
from auth import hash_password


def seed():
    init_db()
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding database with demo data...")

    # ── Users ──
    admin = User(
        email="admin@lasustech.edu.ng",
        password_hash=hash_password("admin123"),
        name="Dr. Admin User",
        role="admin",
    )
    lecturer = User(
        email="lecturer@lasustech.edu.ng",
        password_hash=hash_password("lecturer123"),
        name="Mr. Akinrinlola Ibitoye Akinfolami",
        role="lecturer",
    )
    db.add_all([admin, lecturer])
    db.flush()

    # ── Department & Course data ──
    departments = ["Computer Science", "Mathematics", "Physics", "Chemistry"]
    course_data = [
        ("CSC401", "Artificial Intelligence", "Computer Science", 400, 4),
        ("CSC402", "Software Engineering", "Computer Science", 400, 3),
        ("CSC403", "Data Structures & Algorithms", "Computer Science", 300, 3),
        ("CSC404", "Database Management Systems", "Computer Science", 300, 3),
        ("CSC405", "Computer Networks", "Computer Science", 400, 3),
        ("CSC406", "Operating Systems", "Computer Science", 300, 3),
        ("MTH401", "Numerical Analysis", "Mathematics", 400, 3),
        ("MTH402", "Abstract Algebra", "Mathematics", 400, 3),
        ("PHY401", "Quantum Mechanics", "Physics", 400, 3),
        ("CHM401", "Organic Chemistry", "Chemistry", 400, 3),
    ]
    courses = []
    for code, name, dept, level, credits in course_data:
        courses.append(Course(code=code, name=name, department=dept, level=level, credit_units=credits))
    db.add_all(courses)
    db.flush()

    # ── Students ──
    student_data = [
        ("220303010117", "Famuditi", "Babatomiwa Abdul Hamid", "babatomiwa@lasustech.edu.ng", "Computer Science", 400, 2022),
        ("220303010201", "Adebayo", "Oluwatobiloba Emmanuel", "adebayo@lasustech.edu.ng", "Computer Science", 400, 2022),
        ("220303010305", "Okafor", "Chidinma Blessing", "okafor@lasustech.edu.ng", "Computer Science", 300, 2023),
        ("220303010410", "Ibrahim", "Fatima Yusuf", "ibrahim@lasustech.edu.ng", "Computer Science", 300, 2023),
        ("220303010512", "Eze", "Chukwudi Michael", "eze@lasustech.edu.ng", "Computer Science", 400, 2022),
        ("220303010618", "Bello", "Amina Suleiman", "bello@lasustech.edu.ng", "Mathematics", 400, 2022),
        ("220303010720", "Okonkwo", "Ifeanyi Godwin", "okonkwo@lasustech.edu.ng", "Physics", 400, 2022),
        ("220303010825", "Nwachukwu", "Chiamaka Precious", "nwachukwu@lasustech.edu.ng", "Chemistry", 400, 2022),
        # These students will have low performance (for at-risk demo)
        ("220303010931", "Balogun", "Tunde Rasheed", "balogun@lasustech.edu.ng", "Computer Science", 300, 2023),
        ("220303011045", "Obi", "Ngozi Ada", "obi@lasustech.edu.ng", "Computer Science", 300, 2023),
    ]
    students = []
    for matric, first, last, email, dept, level, year in student_data:
        students.append(Student(
            matric_no=matric,
            first_name=first,
            last_name=last,
            email=email,
            department=dept,
            level=level,
            enrollment_year=year,
        ))
    db.add_all(students)
    db.flush()

    # ── Academic Records ──
    # Generate varied records: good students (index 0-4), average (5-7), struggling (8-9)
    import random
    random.seed(42)

    semesters = [("first", "2024/2025"), ("second", "2024/2025"), ("first", "2025/2026")]
    records = []

    for si, student in enumerate(students):
        # Pick courses matching student's department
        student_courses = [c for c in courses if c.department == student.department]
        if not student_courses:
            student_courses = courses[:4]

        for sem, year in semesters:
            for ci, course in enumerate(student_courses[:4]):  # 4 courses per semester
                if si < 5:
                    # Good students: high scores with slight variation
                    att = random.uniform(70, 98)
                    ass = random.uniform(65, 95)
                    ca = random.uniform(60, 92)
                    ex = random.uniform(60, 90)
                elif si < 8:
                    # Average students: medium scores
                    att = random.uniform(50, 80)
                    ass = random.uniform(45, 75)
                    ca = random.uniform(45, 70)
                    ex = random.uniform(40, 70)
                else:
                    # Struggling students: low scores
                    att = random.uniform(20, 55)
                    ass = random.uniform(15, 50)
                    ca = random.uniform(20, 48)
                    ex = random.uniform(15, 45)

                total = compute_total(att, ass, ca, ex)
                grade = compute_grade(total)

                records.append(AcademicRecord(
                    student_id=student.id,
                    course_id=course.id,
                    attendance_score=round(att, 1),
                    assignment_score=round(ass, 1),
                    ca_score=round(ca, 1),
                    exam_score=round(ex, 1),
                    total_score=total,
                    grade=grade,
                    semester=sem,
                    academic_year=year,
                ))

    db.add_all(records)
    db.commit()
    db.close()

    print(f"Seeded: {len(students)} students, {len(courses)} courses, {len(records)} academic records")
    print("Demo accounts:")
    print("  Admin:    admin@lasustech.edu.ng / admin123")
    print("  Lecturer: lecturer@lasustech.edu.ng / lecturer123")


if __name__ == "__main__":
    seed()
