# SAPPS — Build Notes

## Project
Student Academic Performance Prediction System (SAPPS) — ML-powered early warning system for LASUSTECH.
Final year project for FAMUDITI BABATOMIWA ABDUL HAMID (Matric: 220303010117).

## Stack
- **Backend:** Python FastAPI + SQLAlchemy + SQLite + scikit-learn
- **Frontend:** Next.js 15 App Router + TypeScript + Tailwind CSS + Recharts + Lucide React
- **ML:** Random Forest Classifier (scikit-learn) with Decision Tree fallback
- **Auth:** JWT (python-jose) + bcrypt password hashing

## Architecture
```
tomiwa-final-year-project/
├── plan/build-plan.md
├── backend/
│   ├── main.py              # FastAPI entry point (port 8000)
│   ├── config.py
│   ├── database.py           # SQLAlchemy engine + session
│   ├── models.py             # ORM models + grade computation
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── auth.py               # JWT + bcrypt utilities
│   ├── seed.py               # Demo data seeder
│   ├── ml/
│   │   ├── trainer.py        # RandomForest model training
│   │   └── predictor.py      # Grade prediction + recommendations
│   └── routes/
│       ├── auth_router.py
│       ├── students_router.py
│       ├── courses_router.py
│       ├── records_router.py
│       ├── predictions_router.py
│       └── stats_router.py
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # Root layout + Toaster
    │   │   ├── page.tsx            # Redirect to /login or /dashboard
    │   │   ├── (auth)/
    │   │   │   ├── layout.tsx      # Centered auth layout
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   └── (app)/
    │   │       ├── layout.tsx      # Sidebar + Topbar protected layout
    │   │       ├── dashboard/page.tsx
    │   │       ├── students/
    │   │       │   ├── page.tsx    # Student list with search
    │   │       │   ├── new/page.tsx
    │   │       │   └── [id]/page.tsx  # Detail + edit + predict + records
    │   │       ├── courses/page.tsx
    │   │       ├── records/
    │   │       │   ├── page.tsx    # Filterable records table
    │   │       │   ├── new/page.tsx
    │   │       │   └── [id]/page.tsx
    │   │       ├── predictions/page.tsx  # Train, batch predict, history
    │   │       └── reports/page.tsx      # At-risk, charts, dept breakdown
    │   ├── components/
    │   │   ├── layout/Sidebar.tsx
    │   │   ├── layout/Topbar.tsx
    │   │   ├── ui/spinner.tsx
    │   │   ├── ui/badge.tsx
    │   │   └── charts/
    │   │       ├── GradeDistributionChart.tsx
    │   │       └── PerformanceTrendChart.tsx
    │   ├── hooks/useAuth.ts
    │   ├── lib/api.ts           # All API calls + localStorage token
    │   └── types/index.ts
    └── .env
```

## How to Run

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py          # Load demo data
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev             # → http://localhost:3000
```

### Demo Credentials
- **Admin:** admin@lasustech.edu.ng / admin123
- **Lecturer:** lecturer@lasustech.edu.ng / lecturer123

## API Docs
Once backend is running: http://localhost:8000/docs (Swagger UI)

## ML Pipeline
1. Add students and courses
2. Add academic records (seed data provides 120 records)
3. Go to Predictions → Train Model (requires ≥10 records)
4. Predict individual students from their detail page, or batch predict all
5. Check Reports for at-risk students and grade distributions

## Environment Variables
### Backend (optional — defaults work out of the box)
- `JWT_SECRET_KEY` — defaults to dev key
- `DATABASE_URL` — defaults to `sqlite:///./sapps.db`

### Frontend (.env)
- `NEXT_PUBLIC_API_URL=http://localhost:8000`
