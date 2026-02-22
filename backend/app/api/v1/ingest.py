from fastapi import APIRouter
from app.schemas.ingest_schema import DataPoint
from app.services.storage import IncidentStorage
from app.services.notifications.notification_service import NotificationService
from app.services.notifications.slack_notifier import SlackNotifier
from app.services.notifications.email_notifier import EmailNotifier

from app.services.anomaly_detector import AnomalyDetector
from app.services.incident_manager import IncidentManager
storage = IncidentStorage()

router = APIRouter()

detector = AnomalyDetector()

incident_manager = IncidentManager()
slack = SlackNotifier("https://hooks.slack.com/services/XXXX/XXXX/XXXX")
email = EmailNotifier(
    smtp_host="smtp.gmail.com",
    smtp_port=465,
    username="ennasiri24@",
    password="nketotlvkcsrmzdo",
    sender="ennasiri24@gmail.com",
    receiver="ennasiri24@gmail.com"
)

notifier = NotificationService(slack_notifier=slack, email_notifier=email)


@router.post("/")
def ingest_data(data: DataPoint):
    datapoint = data.dict()

    # 1) anomaly detection
    anomaly_result = detector.predict(datapoint["values"])

    # 2) incident creation
    incident = incident_manager.create_incident(datapoint, anomaly_result)

    saved = storage.save(incident)
    notifier.notify_if_needed(incident)

    return {
    "message": "data received",
    "incident": incident,
    "id": saved.id
     }
