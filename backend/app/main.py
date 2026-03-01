import os
from app.db.base import Base
from app.db.session import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version
)

# Build allowed origins: start from config defaults, then add any
# comma-separated origins from ALLOWED_ORIGINS env var (easy to set on Railway)
_extra = os.getenv("ALLOWED_ORIGINS", "")
_origins = list(settings.cors_origins)
for _o in _extra.split(","):
    _o = _o.strip()
    if _o:
        _origins.append(_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(api_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
