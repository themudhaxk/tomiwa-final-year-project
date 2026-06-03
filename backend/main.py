from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import init_db
from routes.auth_router import router as auth_router
from routes.students_router import router as students_router
from routes.courses_router import router as courses_router
from routes.records_router import router as records_router
from routes.predictions_router import router as predictions_router
from routes.stats_router import router as stats_router

app = FastAPI(
    title="SAPPS — Student Academic Performance Prediction System",
    version="1.0.0",
    description="ML-powered student academic performance prediction for LASUSTECH",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(students_router)
app.include_router(courses_router)
app.include_router(records_router)
app.include_router(predictions_router)
app.include_router(stats_router)


@app.on_event("startup")
def on_startup():
    init_db()
    # Auto-seed demo data if DB is empty (Render first deploy)
    try:
        from seed import seed
        seed()
    except Exception:
        pass  # Seed is best-effort; API still works without it


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SAPPS Backend"}
