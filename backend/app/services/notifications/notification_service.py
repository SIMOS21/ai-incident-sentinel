from app.core import runtime_config


class NotificationService:
    def __init__(self, slack_notifier=None, email_notifier=None):
        self.slack_notifier = slack_notifier
        self.email_notifier = email_notifier

    def notify_if_needed(self, incident: dict):
        severity = incident["severity"]
        cfg = runtime_config.email_config

        # Determine severity threshold from runtime config
        threshold = cfg.get("threshold", "critical")
        if threshold == "critical":
            should_notify = severity == "critical"
        else:  # "high" means high + critical
            should_notify = severity in ("high", "critical")

        if not should_notify:
            return

        message = (
            f"INCIDENT DETECTED\n"
            f"Source:   {incident['source']}\n"
            f"Severity: {incident['severity'].upper()}\n"
            f"Score:    {incident['score']}\n"
            f"Message:  {incident['message']}\n"
        )

        if self.slack_notifier:
            self.slack_notifier.send(message)

        # Send email only if runtime config has email enabled with a receiver
        if cfg.get("enabled") and cfg.get("receiver"):
            if self.email_notifier:
                original_receiver = self.email_notifier.receiver
                self.email_notifier.receiver = cfg["receiver"]
                self.email_notifier.send(
                    subject=f"[AI Sentinel] {incident['severity'].upper()} incident detected",
                    body=message,
                )
                self.email_notifier.receiver = original_receiver
        elif self.email_notifier:
            # Fall back to the static receiver configured via env vars
            self.email_notifier.send(
                subject=f"[AI Sentinel] {incident['severity'].upper()} incident detected",
                body=message,
            )
