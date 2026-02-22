import requests

class SlackNotifier:
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    def send(self, message: str):
        payload = {"text": message}
        try:
            requests.post(self.webhook_url, json=payload)
        except Exception as e:
            print("Slack notification failed:", e)
