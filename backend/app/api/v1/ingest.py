from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.ingest_schema import DataPoint
from app.services.anomaly_detector import AnomalyDetector
from app.services.incident_manager import IncidentManager
from app.services.notifications.email_notifier import EmailNotifier
from app.services.notifications.notification_service import NotificationService
from app.services.notifications.slack_notifier import SlackNotifier
from app.services.storage import IncidentStorage

router = APIRouter()
settings = get_settings()

storage = IncidentStorage()
detector = AnomalyDetector()
incident_manager = IncidentManager()


def _build_notifier() -> NotificationService:
    slack_notifier = None
    email_notifier = None

    if settings.slack_webhook_url:
        slack_notifier = SlackNotifier(settings.slack_webhook_url)

    if (
        settings.smtp_host
        and settings.smtp_username
        and settings.smtp_password
        and settings.smtp_sender
        and settings.smtp_receiver
    ):
        email_notifier = EmailNotifier(
            smtp_host=settings.smtp_host,
            smtp_port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            sender=settings.smtp_sender,
            receiver=settings.smtp_receiver,
        )

    return NotificationService(slack_notifier=slack_notifier, email_notifier=email_notifier)


notifier = _build_notifier()


@router.post("/")
def ingest_data(data: DataPoint):
    datapoint = data.model_dump()

    anomaly_result = detector.predict(datapoint["values"])
    incident = incident_manager.create_incident(datapoint, anomaly_result)

    saved = storage.save(incident)
    notifier.notify_if_needed(incident)

    return {
        "message": "data received",
        "incident": incident,
        "id": saved.id,
    }

