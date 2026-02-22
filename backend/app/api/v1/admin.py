"""
Endpoints d'administration avec génération en arrière-plan
backend/app/api/v1/admin.py
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random
import time
from threading import Thread

from app.db.session import SessionLocal
from app.models.incident import Incident
from app.services.anomaly_detector import AnomalyDetector
from app.services.incident_manager import IncidentManager
from app.services.storage import IncidentStorage

router = APIRouter()
detector = AnomalyDetector()
incident_manager = IncidentManager()
storage = IncidentStorage()

# État global du générateur (en mémoire)
generator_state = {
    "running": False,
    "thread": None,
    "settings": {},
    "generated_count": 0
}

class GeneratorSettings(BaseModel):
    interval: int = 3
    anomalyRate: int = 30

class GenerateTestRequest(BaseModel):
    count: int = 10

SOURCES = [
    "sensor-mail",
    "sensor-payment", 
    "sensor-api",
    "sensor-database",
    "sensor-login",
    "sensor-upload",
    "sensor-search",
    "sensor-checkout"
]

def generate_random_incident(anomaly_rate=30):
    """Génère un incident aléatoire"""
    is_anomaly = random.random() < (anomaly_rate / 100)
    
    if is_anomaly:
        temperature = random.uniform(7000, 9000)
        humidity = random.uniform(0, 30)
    else:
        temperature = random.uniform(5800, 6500)
        humidity = random.uniform(40, 70)
    
    datapoint = {
        "source": random.choice(SOURCES),
        "timestamp": datetime.utcnow().isoformat(),
        "values": {
            "temperature": round(temperature, 2),
            "humidity": round(humidity, 2)
        }
    }
    
    # Détecter anomalie
    anomaly_result = detector.predict(datapoint["values"])
    
    # Créer incident
    incident = incident_manager.create_incident(datapoint, anomaly_result)
    
    # Sauvegarder
    saved = storage.save(incident)
    
    return saved

def background_generator_task():
    """Tâche de génération en arrière-plan"""
    print("🚀 Générateur démarré en arrière-plan")
    
    while generator_state["running"]:
        try:
            settings = generator_state.get("settings", {})
            interval = settings.get("interval", 3)
            anomaly_rate = settings.get("anomalyRate", 30)
            
            # Générer 1 incident
            incident = generate_random_incident(anomaly_rate)
            generator_state["generated_count"] += 1
            
            print(f"✅ Incident généré: {incident.severity} (Total: {generator_state['generated_count']})")
            
            # Attendre
            time.sleep(interval)
            
        except Exception as e:
            print(f"❌ Erreur générateur: {e}")
            time.sleep(1)
    
    print("🛑 Générateur arrêté")

@router.post("/generator/start")
async def start_generator(settings: GeneratorSettings):
    """
    Démarre le générateur en arrière-plan
    Le générateur continue même si la page Admin est fermée
    """
    if generator_state["running"]:
        return {
            "status": "already_running",
            "message": "Le générateur est déjà en cours",
            "generated": generator_state["generated_count"]
        }
    
    # Démarrer le générateur
    generator_state["running"] = True
    generator_state["settings"] = settings.dict()
    generator_state["generated_count"] = 0
    
    # Lancer dans un thread séparé
    thread = Thread(target=background_generator_task, daemon=True)
    thread.start()
    generator_state["thread"] = thread
    
    return {
        "status": "started",
        "message": "Générateur démarré en arrière-plan",
        "settings": settings.dict()
    }

@router.post("/generator/stop")
async def stop_generator():
    """Arrête le générateur"""
    if not generator_state["running"]:
        return {
            "status": "not_running",
            "message": "Le générateur n'est pas en cours"
        }
    
    generator_state["running"] = False
    generated = generator_state["generated_count"]
    
    return {
        "status": "stopped",
        "message": f"Générateur arrêté. {generated} incidents générés.",
        "generated": generated
    }

@router.get("/generator/status")
async def get_generator_status():
    """Obtenir le statut du générateur"""
    return {
        "running": generator_state["running"],
        "generated": generator_state["generated_count"],
        "settings": generator_state.get("settings", {}),
        "message": "En cours" if generator_state["running"] else "Arrêté"
    }

@router.post("/generate-test")
async def generate_test_data(request: GenerateTestRequest):
    """
    Génère un nombre spécifique d'incidents de test
    (génération immédiate, pas en arrière-plan)
    """
    try:
        generated = []
        
        for _ in range(request.count):
            incident = generate_random_incident(anomaly_rate=30)
            generated.append(incident)
        
        return {
            "generated": len(generated),
            "incidents": [{"id": inc.id, "severity": inc.severity} for inc in generated]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.post("/crisis-scenario")
async def create_crisis_scenario():
    """
    Génère un scénario de crise avec beaucoup d'incidents critiques
    """
    try:
        generated = []
        
        # 20 incidents critiques
        for _ in range(20):
            incident = generate_random_incident(anomaly_rate=90)  # 90% anomalies
            generated.append(incident)
        
        return {
            "generated": len(generated),
            "message": "Scénario de crise créé",
            "critical": sum(1 for inc in generated if inc.severity == 'high')
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.delete("/clear-database")
async def clear_database():
    """
    Vide complètement la base de données d'incidents
    ⚠️ DANGER: Supprime toutes les données
    """
    try:
        db = SessionLocal()
        try:
            count = db.query(Incident).count()
            db.query(Incident).delete()
            db.commit()
            
            # Réinitialiser le compteur du générateur
            generator_state["generated_count"] = 0
            
            return {
                "deleted": count,
                "message": f"{count} incidents supprimés"
            }
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/stats")
async def get_admin_stats():
    """Statistiques pour le panneau admin"""
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
                    "severity": last_incident.severity if last_incident else None
                } if last_incident else None,
                "generator_running": generator_state["running"],
                "generator_count": generator_state["generated_count"]
            }
        finally:
            db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")
