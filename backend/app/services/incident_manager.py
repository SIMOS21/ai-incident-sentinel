from datetime import datetime

class IncidentManager:
    def __init__(self):
        pass

    def create_incident(self, datapoint: dict, anomaly: dict) -> dict:
        severity = self._assign_severity(anomaly["score"])

        incident = {
            "timestamp": datapoint["timestamp"],
            "source": datapoint["source"],
            "values": datapoint["values"],
            "score": anomaly["score"],
            "is_anomaly": anomaly["is_anomaly"],
            "severity": severity,
            "type": "anomaly_detection",
            "message": f"Anomalous behavior detected in source '{datapoint['source']}' with severity {severity}"
        }

        return incident

    def _assign_severity(self, score: float) -> str:
        if score < -0.20:
            return "critical"
        elif score < -0.10:
            return "high"
        elif score < -0.05:
            return "medium"
        else:
            return "low"
