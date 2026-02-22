from fastapi import APIRouter
from app.db.session import SessionLocal
from app.models.incident import Incident

router = APIRouter()

@router.get("/")
def list_incidents():
    db = SessionLocal()
    incidents = db.query(Incident).order_by(Incident.id.desc()).all()

    result = []
    for i in incidents:
        result.append({
            "id": i.id,
            "timestamp": i.timestamp,
            "source": i.source,
            "values": i.values,
            "score": i.score,
            "is_anomaly": bool(i.is_anomaly),
            "severity": i.severity,
            "type": i.type,
            "message": i.message
        })
    db.close()
    return result
