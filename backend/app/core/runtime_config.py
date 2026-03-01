# Mutable runtime configuration — changed via Admin API at runtime
# (not persisted across server restarts; set env vars for permanent config)

email_config: dict = {
    "enabled": False,
    "receiver": "",
    "threshold": "critical",   # "critical" = only critical | "high" = high + critical
}

smtp_config: dict = {
    "host": "",
    "port": 465,
    "username": "",
    "password": "",
    "sender": "",
}
