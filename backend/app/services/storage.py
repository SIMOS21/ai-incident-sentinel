from app.db.session import SessionLocal
from app.models.incident import Incident

class IncidentStorage:

    def save(self, incident_data: dict):
        db = SessionLocal()
        incident = Incident(
            timestamp=incident_data["timestamp"],
            source=incident_data["source"],
            values=incident_data["values"],
            score=incident_data["score"],
            is_anomaly=1 if incident_data["is_anomaly"] else 0,
            severity=incident_data["severity"],
            type=incident_data["type"],
            message=incident_data["message"]
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        db.close()
        return incident
