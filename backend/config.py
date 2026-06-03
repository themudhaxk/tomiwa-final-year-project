import os

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "sapps-dev-secret-key-change-in-production-64-chars-min")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 480  # 8 hours

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sapps.db")

# CORS — build from env or default to localhost dev ports
if os.getenv("CORS_ALLOW_ALL", "") == "true":
    # Render production: allow the frontend domain (set via FRONTEND_URL)
    _frontend = os.getenv("FRONTEND_URL", "")
    CORS_ORIGINS = [_frontend] if _frontend else ["*"]
elif os.getenv("CORS_ORIGINS", ""):
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ]

# Allow the Render frontend domain if set
_frontend_url = os.getenv("FRONTEND_URL", "")
if _frontend_url and _frontend_url not in CORS_ORIGINS:
    CORS_ORIGINS.append(_frontend_url)
