class NotificationService:
    def __init__(self, slack_notifier=None, email_notifier=None):
        self.slack_notifier = slack_notifier
        self.email_notifier = email_notifier

    def notify_if_needed(self, incident: dict):
        severity = incident["severity"]

        # rules
        notify = severity in ["high", "critical"]

        if not notify:
            return

        message = f"""
🚨 INCIDENT DETECTED
Source: {incident['source']}
Severity: {incident['severity'].upper()}
Score: {incident['score']}
Message: {incident['message']}
        """

        if self.slack_notifier:
            self.slack_notifier.send(message)

        if self.email_notifier:
            self.email_notifier.send(
                subject=f"[AI Sentinel] {incident['severity'].upper()} incident detected",
                body=message
            )
