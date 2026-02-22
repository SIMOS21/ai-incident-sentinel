from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime

class DataPoint(BaseModel):
    timestamp: datetime = Field(..., description="Timestamp of the event")
    source: str = Field(..., description="Origin of the data")
    values: Dict[str, float] = Field(..., description="Numeric metrics for analysis")
