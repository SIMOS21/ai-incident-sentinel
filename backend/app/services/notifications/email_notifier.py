import smtplib
from email.mime.text import MIMEText

class EmailNotifier:
    def __init__(self, smtp_host, smtp_port, username, password, sender, receiver):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.sender = sender
        self.receiver = receiver

    def send(self, subject: str, body: str):
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = self.sender
        msg["To"] = self.receiver

        try:
            with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
                server.login(self.username, self.password)
                server.sendmail(self.sender, self.receiver, msg.as_string())
        except Exception as e:
            print("Email notification failed:", e)
