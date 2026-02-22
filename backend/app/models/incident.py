from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from app.db.base import Base
from datetime import datetime

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String, index=True)
    values = Column(JSON)
    score = Column(Float)
    is_anomaly = Column(Integer)  # 0 or 1
    severity = Column(String)
    type = Column(String)
    message = Column(String)
