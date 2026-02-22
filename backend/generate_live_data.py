import requests
import random
import time
from datetime import datetime, timezone

API_URL = "http://localhost:8000/v1/ingest/"

SOURCES = ["sensor-mail", "sensor-payment", "sensor-api", "sensor-database"]

def generate_incident():
    is_anomaly = random.random() < 0.3
    
    if is_anomaly:
        temperature = random.uniform(7000, 9000)
        humidity = random.uniform(0, 30)
    else:
        temperature = random.uniform(5800, 6500)
        humidity = random.uniform(40, 70)
    
    return {
        "source": random.choice(SOURCES),
        "timestamp": datetime.now(timezone.utc).isoformat(),  # Fix du warning
        "values": {
            "temperature": round(temperature, 2),
            "humidity": round(humidity, 2)
        }
    }

def main():
    print("🚀 GÉNÉRATEUR D'INCIDENTS LIVE")
    print("=" * 70)
    print(f"📡 Endpoint: {API_URL}")
    print("🔴 Ctrl+C pour arrêter\n")
    
    count = 0
    errors = 0
    
    try:
        while True:
            incident = generate_incident()
            
            try:
                # Timeout plus long
                response = requests.post(API_URL, json=incident, timeout=60)
                
                if response.status_code == 200:
                    data = response.json()
                    inc = data.get("incident", {})
                    severity = inc.get("severity", "?")
                    score = inc.get("score", 0)
                    
                    icons = {"high": "🔴", "medium": "🟡", "low": "🟢"}
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] {icons.get(severity, '⚪')} "
                          f"{severity:6} | {incident['source']:15} | Score: {score:6.2f}")
                    count += 1
                    errors = 0  # Reset compteur erreurs
                else:
                    print(f"❌ HTTP {response.status_code}: {response.text[:100]}")
                    errors += 1
                    
            except requests.exceptions.Timeout:
                print(f"⏱️  Timeout - Le backend est lent. Incident ignoré.")
                errors += 1
            except requests.exceptions.ConnectionError:
                print(f"❌ Connexion impossible. Le backend tourne-t-il ?")
                errors += 1
                if errors > 3:
                    print("\n⚠️  Trop d'erreurs. Arrêt.")
                    break
            except Exception as e:
                print(f"❌ Erreur: {e}")
                errors += 1
            
            time.sleep(3)  # Pause entre chaque incident
            
    except KeyboardInterrupt:
        print(f"\n🛑 Arrêté. {count} incidents générés avec succès.")

if __name__ == "__main__":
    main()