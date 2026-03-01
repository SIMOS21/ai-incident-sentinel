from datetime import datetime

# Maps source sensor → (incident type, messages per severity)
_SOURCE_MAP = {
    "sensor-payment": ("payment", {
        "critical": "Critical fraud pattern detected — large unauthorized transaction",
        "high":     "Suspicious payment activity — multiple failed attempts",
        "medium":   "Unusual payment amount or slow response time",
        "low":      "Payment transaction processed normally",
    }),
    "sensor-login": ("login", {
        "critical": "Brute-force attack detected — account lockout triggered",
        "high":     "Multiple failed login attempts from unknown device",
        "medium":   "Login from new location or device detected",
        "low":      "Successful user authentication",
    }),
    "sensor-api": ("api_call", {
        "critical": "API endpoint returning critical error rate — service degraded",
        "high":     "High response latency and elevated error rate detected",
        "medium":   "Elevated API request volume or timeout spike",
        "low":      "API call completed within normal parameters",
    }),
    "sensor-database": ("database", {
        "critical": "Database deadlock storm — service availability impacted",
        "high":     "Slow query detected with high connection pool usage",
        "medium":   "Abnormal row count in database operation",
        "low":      "Database query executed successfully",
    }),
    "sensor-mail": ("email", {
        "critical": "Mass email campaign detected — possible spam or data exfiltration",
        "high":     "High bounce rate and spam score on outgoing mail",
        "medium":   "Unusual recipient count or delayed mail delivery",
        "low":      "Email sent successfully",
    }),
    "sensor-checkout": ("checkout", {
        "critical": "High-value checkout anomaly — possible card testing attack",
        "high":     "Multiple payment retries with elevated failure rate",
        "medium":   "Slow checkout process or unusual cart value",
        "low":      "Checkout completed successfully",
    }),
    "sensor-search": ("search", {
        "critical": "Search injection attempt detected — zero results with oversized query",
        "high":     "Search engine overloaded — high cache miss and latency",
        "medium":   "Unusually long search query or slow response",
        "low":      "Search query returned results normally",
    }),
    "sensor-upload": ("upload", {
        "critical": "Extremely large file upload — possible storage abuse or data exfiltration",
        "high":     "Upload failed repeatedly — high error and retry count",
        "medium":   "Upload slower than expected for file size",
        "low":      "File uploaded successfully",
    }),
}

_DEFAULT_TYPE = "anomaly_detection"
_DEFAULT_MESSAGES = {
    "critical": "Critical anomaly detected in system behavior",
    "high":     "High-severity anomaly flagged by ML model",
    "medium":   "Moderate anomaly detected — review recommended",
    "low":      "Low-level deviation observed — within acceptable range",
}


class IncidentManager:
    def __init__(self):
        pass

    def create_incident(self, datapoint: dict, anomaly: dict) -> dict:
        severity = self._assign_severity(anomaly["score"])
        source = datapoint.get("source", "unknown")

        inc_type, messages = _SOURCE_MAP.get(source, (_DEFAULT_TYPE, _DEFAULT_MESSAGES))
        message = messages.get(severity, f"Anomalous behavior detected in {source}")

        return {
            "timestamp": datapoint["timestamp"],
            "source": source,
            "values": datapoint["values"],
            "score": anomaly["score"],
            "is_anomaly": anomaly["is_anomaly"],
            "severity": severity,
            "type": inc_type,
            "message": message,
        }

    def _assign_severity(self, score: float) -> str:
        if score < -0.20:
            return "critical"
        elif score < -0.10:
            return "high"
        elif score < -0.05:
            return "medium"
        else:
            return "low"
