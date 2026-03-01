"""
Administration endpoints — background generator + email config
backend/app/api/v1/admin.py
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import random
import time
from threading import Thread

from app.db.session import SessionLocal
from app.models.incident import Incident
from app.services.anomaly_detector import AnomalyDetector
from app.services.incident_manager import IncidentManager
from app.services.storage import IncidentStorage
from app.core import runtime_config

router = APIRouter()
detector = AnomalyDetector()
incident_manager = IncidentManager()
storage = IncidentStorage()

# In-memory generator state
generator_state = {
    "running": False,
    "thread": None,
    "settings": {},
    "generated_count": 0,
}


# ---------------------------------------------------------------------------
# Realistic per-type data generators
# Each returns (source: str, values: dict) with 4 numeric features.
# "Normal" values are tight clusters; "anomaly" values are clear outliers.
# ---------------------------------------------------------------------------

def _payment(anomaly: bool):
    if anomaly:
        return "sensor-payment", {
            "amount":           round(random.uniform(3000, 50000), 2),
            "response_time_ms": random.randint(2000, 8000),
            "failed_attempts":  random.randint(3, 10),
            "num_items":        random.randint(1, 3),
        }
    return "sensor-payment", {
        "amount":           round(random.uniform(5, 500), 2),
        "response_time_ms": random.randint(80, 500),
        "failed_attempts":  0,
        "num_items":        random.randint(1, 10),
    }


def _login(anomaly: bool):
    if anomaly:
        return "sensor-login", {
            "attempt_count":     random.randint(10, 50),
            "session_duration_s": random.randint(1, 5),
            "failed_count_24h":  random.randint(5, 20),
            "new_device":        1,
        }
    return "sensor-login", {
        "attempt_count":     1,
        "session_duration_s": random.randint(120, 3600),
        "failed_count_24h":  random.randint(0, 1),
        "new_device":        0,
    }


def _api(anomaly: bool):
    if anomaly:
        return "sensor-api", {
            "response_time_ms": random.randint(5000, 30000),
            "error_rate_pct":   round(random.uniform(30, 100), 1),
            "requests_per_min": random.randint(500, 5000),
            "timeout_count":    random.randint(5, 50),
        }
    return "sensor-api", {
        "response_time_ms": random.randint(50, 300),
        "error_rate_pct":   round(random.uniform(0, 2), 1),
        "requests_per_min": random.randint(10, 100),
        "timeout_count":    0,
    }


def _database(anomaly: bool):
    if anomaly:
        return "sensor-database", {
            "query_time_ms":      random.randint(5000, 30000),
            "rows_affected":      random.randint(50000, 1000000),
            "pool_usage_pct":     round(random.uniform(90, 100), 1),
            "deadlocks":          random.randint(1, 10),
        }
    return "sensor-database", {
        "query_time_ms":      random.randint(10, 200),
        "rows_affected":      random.randint(1, 1000),
        "pool_usage_pct":     round(random.uniform(10, 50), 1),
        "deadlocks":          0,
    }


def _mail(anomaly: bool):
    if anomaly:
        return "sensor-mail", {
            "send_time_ms":      random.randint(5000, 20000),
            "recipient_count":   random.randint(1000, 50000),
            "spam_score_pct":    round(random.uniform(70, 100), 1),
            "bounce_rate_pct":   round(random.uniform(30, 90), 1),
        }
    return "sensor-mail", {
        "send_time_ms":      random.randint(100, 500),
        "recipient_count":   random.randint(1, 10),
        "spam_score_pct":    round(random.uniform(0, 10), 1),
        "bounce_rate_pct":   round(random.uniform(0, 3), 1),
    }


def _checkout(anomaly: bool):
    if anomaly:
        return "sensor-checkout", {
            "cart_value":          round(random.uniform(5000, 50000), 2),
            "payment_time_s":      random.randint(60, 300),
            "retry_count":         random.randint(3, 10),
            "failed_payment_24h":  random.randint(5, 20),
        }
    return "sensor-checkout", {
        "cart_value":          round(random.uniform(10, 300), 2),
        "payment_time_s":      random.randint(2, 10),
        "retry_count":         0,
        "failed_payment_24h":  random.randint(0, 1),
    }


def _search(anomaly: bool):
    if anomaly:
        return "sensor-search", {
            "query_time_ms":      random.randint(5000, 20000),
            "results_count":      0,
            "query_length":       random.randint(500, 5000),
            "cache_miss_rate_pct": round(random.uniform(80, 100), 1),
        }
    return "sensor-search", {
        "query_time_ms":      random.randint(20, 200),
        "results_count":      random.randint(5, 100),
        "query_length":       random.randint(3, 50),
        "cache_miss_rate_pct": round(random.uniform(0, 20), 1),
    }


def _upload(anomaly: bool):
    if anomaly:
        return "sensor-upload", {
            "file_size_mb":      round(random.uniform(500, 5000), 1),
            "upload_duration_s": random.randint(600, 3600),
            "error_count":       random.randint(1, 10),
            "retry_count":       random.randint(3, 10),
        }
    return "sensor-upload", {
        "file_size_mb":      round(random.uniform(0.1, 50), 1),
        "upload_duration_s": random.randint(1, 30),
        "error_count":       0,
        "retry_count":       0,
    }


TYPE_GENERATORS = [_payment, _login, _api, _database, _mail, _checkout, _search, _upload]


def generate_random_incident(anomaly_rate: int = 30):
    is_anomaly = random.random() < (anomaly_rate / 100)
    gen = random.choice(TYPE_GENERATORS)
    source, values = gen(is_anomaly)

    datapoint = {
        "source": source,
        "timestamp": datetime.utcnow().isoformat(),
        "values": values,
    }

    anomaly_result = detector.predict(datapoint["values"])
    incident = incident_manager.create_incident(datapoint, anomaly_result)
    saved = storage.save(incident)
    return saved


# ---------------------------------------------------------------------------
# Background generator
# ---------------------------------------------------------------------------

class GeneratorSettings(BaseModel):
    interval: int = 3
    anomalyRate: int = 30


class GenerateTestRequest(BaseModel):
    count: int = 10


def background_generator_task():
    print("Generator started in background")

    while generator_state["running"]:
        try:
            settings = generator_state.get("settings", {})
            interval = settings.get("interval", 3)
            anomaly_rate = settings.get("anomalyRate", 30)

            incident = generate_random_incident(anomaly_rate)
            generator_state["generated_count"] += 1

            print(f"Incident generated: {incident.severity} (Total: {generator_state['generated_count']})")

            time.sleep(interval)

        except Exception as e:
            print(f"Generator error: {e}")
            time.sleep(1)

    print("Generator stopped")


@router.post("/generator/start")
async def start_generator(settings: GeneratorSettings):
    if generator_state["running"]:
        return {
            "status": "already_running",
            "message": "Generator is already running",
            "generated": generator_state["generated_count"],
        }

    generator_state["running"] = True
    generator_state["settings"] = settings.dict()
    generator_state["generated_count"] = 0

    thread = Thread(target=background_generator_task, daemon=True)
    thread.start()
    generator_state["thread"] = thread

    return {
        "status": "started",
        "message": "Generator started in background",
        "settings": settings.dict(),
    }


@router.post("/generator/stop")
async def stop_generator():
    if not generator_state["running"]:
        return {
            "status": "not_running",
            "message": "Generator is not running",
        }

    generator_state["running"] = False
    generated = generator_state["generated_count"]

    return {
        "status": "stopped",
        "message": f"Generator stopped. {generated} incidents generated.",
        "generated": generated,
    }


@router.get("/generator/status")
async def get_generator_status():
    return {
        "running": generator_state["running"],
        "generated": generator_state["generated_count"],
        "settings": generator_state.get("settings", {}),
        "message": "Running" if generator_state["running"] else "Stopped",
    }


@router.post("/generate-test")
async def generate_test_data(request: GenerateTestRequest):
    try:
        generated = []
        for _ in range(request.count):
            incident = generate_random_incident(anomaly_rate=30)
            generated.append(incident)

        return {
            "generated": len(generated),
            "incidents": [{"id": inc.id, "severity": inc.severity} for inc in generated],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/crisis-scenario")
async def create_crisis_scenario():
    try:
        generated = []
        for _ in range(20):
            incident = generate_random_incident(anomaly_rate=90)
            generated.append(incident)

        return {
            "generated": len(generated),
            "message": "Crisis scenario created",
            "critical": sum(1 for inc in generated if inc.severity in ("high", "critical")),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/clear-database")
async def clear_database():
    try:
        db = SessionLocal()
        try:
            count = db.query(Incident).count()
            db.query(Incident).delete()
            db.commit()
            generator_state["generated_count"] = 0
            return {
                "deleted": count,
                "message": f"{count} incidents deleted",
            }
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_admin_stats():
    try:
        db = SessionLocal()
        try:
            total = db.query(Incident).count()
            today = db.query(Incident).filter(
                Incident.timestamp >= datetime.now().replace(hour=0, minute=0, second=0)
            ).count()

            last_incident = db.query(Incident).order_by(Incident.id.desc()).first()

            return {
                "total_incidents": total,
                "today_count": today,
                "last_incident": {
                    "timestamp": last_incident.timestamp.isoformat() if last_incident else None,
                    "severity": last_incident.severity if last_incident else None,
                } if last_incident else None,
                "generator_running": generator_state["running"],
                "generator_count": generator_state["generated_count"],
            }
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Email config endpoints (wired to runtime_config)
# ---------------------------------------------------------------------------

class EmailConfigRequest(BaseModel):
    enabled: bool
    receiver: str
    threshold: str = "critical"   # "critical" | "high"


@router.get("/email-config")
async def get_email_config():
    return runtime_config.email_config


@router.post("/email-config")
async def update_email_config(config: EmailConfigRequest):
    if config.threshold not in ("critical", "high"):
        raise HTTPException(status_code=422, detail="threshold must be 'critical' or 'high'")

    runtime_config.email_config["enabled"] = config.enabled
    runtime_config.email_config["receiver"] = config.receiver.strip()
    runtime_config.email_config["threshold"] = config.threshold

    return {"status": "updated", "config": runtime_config.email_config}
