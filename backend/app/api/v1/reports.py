"""
Endpoint pour générer des rapports PDF d'analyse
backend/app/api/v1/reports.py
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from datetime import datetime, timedelta
from typing import Optional
import os

from app.services.pdf_report_generator import PDFReportGenerator
from app.db.session import SessionLocal

router = APIRouter()

@router.get("/generate")
async def generate_report(
    start_date: Optional[str] = Query(None, description="Date de début (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Date de fin (YYYY-MM-DD)"),
    period: Optional[str] = Query("day", description="Période: day, week, month, all")
):
    """
    Génère un rapport PDF d'analyse pour une période donnée.
    """
    
    try:
        # Déterminer les dates
        now = datetime.now()
        
        if start_date and end_date:
            # Mode personnalisé
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
        
        elif period == "day":
            start = datetime(now.year, now.month, now.day)
            end = now
        
        elif period == "week":
            start = now - timedelta(days=7)
            end = now
        
        elif period == "month":
            start = now - timedelta(days=30)
            end = now
        
        elif period == "all":
            start = datetime(2020, 1, 1)  # ancien historique large
            end = now
        
        else:
            raise HTTPException(status_code=400, detail="Période invalide")
        
        # Génération du PDF
        db = SessionLocal()
        try:
            generator = PDFReportGenerator(db)
            pdf_path = generator.generate_report(start, end, period)

            return FileResponse(
                pdf_path,
                media_type="application/pdf",
                filename=f"rapport_incidents_{start.strftime('%Y%m%d')}_{end.strftime('%Y%m%d')}.pdf"
            )
        
        finally:
            db.close()

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Date invalide: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")
