from fastapi import APIRouter
from app.api.v1 import ingest, incidents, auth, metrics, reports, admin

# Créer le routeur principal
api_router = APIRouter()

# Ajouter les routes v1 avec le bon prefix
api_router.include_router(ingest.router, prefix="/v1/ingest", tags=["Ingestion"])
api_router.include_router(incidents.router, prefix="/v1/incidents", tags=["Incidents"])
api_router.include_router(auth.router, prefix="/v1/auth", tags=["Auth"])
api_router.include_router(metrics.router, prefix="/v1/metrics", tags=["Metrics"])
api_router.include_router(reports.router, prefix="/v1/reports", tags=["Reports"])
api_router.include_router(admin.router, prefix="/v1/admin", tags=["Admin"])  # ← CORRIGÉ