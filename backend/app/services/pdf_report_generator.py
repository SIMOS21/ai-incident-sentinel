"""
Service de génération de rapports PDF professionnels
backend/app/services/pdf_report_generator.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer
import os
import tempfile

from app.models.incident import Incident


class PDFReportGenerator:
    def __init__(self, db: Session):
        self.db = db

        # On utilise seulement un stylesheet propre
        self.styles = getSampleStyleSheet()

        # On ajoute seulement des styles custom sans écraser les existants
        self.styles.add(ParagraphStyle(
            name="CustomTitle",
            fontSize=26,
            textColor=colors.HexColor("#1e40af"),
            alignment=TA_CENTER,
            spaceAfter=20,
            leading=30
        ))

        self.styles.add(ParagraphStyle(
            name="SectionTitle",
            fontSize=16,
            textColor=colors.HexColor("#2563eb"),
            spaceAfter=12,
            spaceBefore=20,
            fontName="Helvetica-Bold"
        ))

        self.styles.add(ParagraphStyle(
            name="Metric",
            fontSize=10,
            textColor=colors.HexColor("#475569"),
            alignment=TA_LEFT
        ))

    # ------------------------------------------------------------
    # PAGE DE GARDE
    # ------------------------------------------------------------
    def _create_cover_page(self, start_date, end_date, period):
        elements = []

        elements.append(Spacer(1, 2 * inch))

        title = Paragraph("AI INCIDENT SENTINEL", self.styles["CustomTitle"])
        elements.append(title)
        elements.append(Spacer(1, 0.2 * inch))

        subtitle = Paragraph("Rapport d'Analyse des Incidents", ParagraphStyle(
            "Subtitle",
            fontSize=18,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#64748b"),
        ))
        elements.append(subtitle)
        elements.append(Spacer(1, 0.8 * inch))

        period_names = {
            "day": "Journalier",
            "week": "Hebdomadaire",
            "month": "Mensuel",
            "all": "Complet",
        }

        period_text = f"""
        <b>Période :</b> {period_names.get(period, "Personnalisée")}<br/>
        <b>Du :</b> {start_date.strftime("%d/%m/%Y %H:%M")}<br/>
        <b>Au :</b> {end_date.strftime("%d/%m/%Y %H:%M")}
        """

        elements.append(Paragraph(period_text, ParagraphStyle(
            "Period",
            fontSize=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#475569")
        )))

        elements.append(Spacer(1, 1 * inch))

        elements.append(Paragraph(
            f"Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}",
            ParagraphStyle("Footer", fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor("#94a3b8"))
        ))

        return elements

    # ------------------------------------------------------------
    # RÉSUMÉ EXÉCUTIF
    # ------------------------------------------------------------
    def _create_executive_summary(self, start_date, end_date):
        elements = []

        elements.append(Paragraph("📊 Résumé Exécutif", self.styles["SectionTitle"]))
        elements.append(Spacer(1, 10))

        incidents = self.db.query(Incident).filter(
            Incident.timestamp >= start_date,
            Incident.timestamp <= end_date
        ).all()

        total = len(incidents)
        high = sum(i.severity in ("high", "critical") for i in incidents)
        medium = sum(i.severity == "medium" for i in incidents)
        low = sum(i.severity == "low" for i in incidents)
        anomalies = sum(i.is_anomaly for i in incidents)
        avg_score = sum(i.score for i in incidents) / total if total > 0 else 0

        kpi_data = [
            ["Métrique", "Valeur", "Description"],
            ["Total Incidents", str(total), "Incidents enregistrés"],
            ["Haute Sévérité", str(high), "Incidents critiques"],
            ["Sévérité Moyenne", str(medium), "Incidents modérés"],
            ["Faible Sévérité", str(low), "Incidents mineurs"],
            ["Anomalies", str(anomalies), "Comportements détectés comme anormaux"],
            ["Score Moyen", f"{avg_score:.3f}", "Score moyen ML"]
        ]

        table = Table(kpi_data, colWidths=[2 * inch, 1.5 * inch, 3 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
        ]))

        elements.append(table)
        return elements

    # ------------------------------------------------------------
    # STATISTIQUES PAR SOURCE
    # ------------------------------------------------------------
    def _create_statistics_section(self, start_date, end_date):
        elements = []

        elements.append(Paragraph("📈 Statistiques Détaillées", self.styles["SectionTitle"]))
        elements.append(Spacer(1, 10))

        incidents = self.db.query(Incident).filter(
            Incident.timestamp >= start_date,
            Incident.timestamp <= end_date
        ).all()

        sources = {}
        for i in incidents:
            sources[i.source] = sources.get(i.source, 0) + 1

        table_data = [["Source", "Incidents", "%"]]
        total = len(incidents)

        for src, count in sorted(sources.items(), key=lambda x: x[1], reverse=True)[:10]:
            pct = (count / total * 100) if total > 0 else 0
            table_data.append([src, str(count), f"{pct:.1f}%"])

        table = Table(table_data, colWidths=[3 * inch, 1.5 * inch, 1.5 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
        ]))

        elements.append(table)
        return elements

    # ------------------------------------------------------------
    # GRAPHIQUE SÉVÉRITÉ
    # ------------------------------------------------------------
    def _create_charts_section(self, start_date, end_date):
        elements = []

        elements.append(Paragraph("📊 Visualisations", self.styles["SectionTitle"]))
        elements.append(Spacer(1, 10))

        incidents = self.db.query(Incident).filter(
            Incident.timestamp >= start_date,
            Incident.timestamp <= end_date
        ).all()

        high = sum(i.severity in ("high", "critical") for i in incidents)
        medium = sum(i.severity == "medium" for i in incidents)
        low = sum(i.severity == "low" for i in incidents)

        if high + medium + low > 0:
            drawing = Drawing(300, 200)
            pie = Pie()
            pie.x = 75
            pie.y = 30
            pie.width = 150
            pie.height = 150
            pie.data = [high, medium, low]
            pie.labels = ["Haute", "Moyenne", "Faible"]
            pie.slices[0].fillColor = colors.red
            pie.slices[1].fillColor = colors.orange
            pie.slices[2].fillColor = colors.green
            drawing.add(pie)

            elements.append(drawing)

        return elements

    # ------------------------------------------------------------
    # INCIDENTS CRITIQUES
    # ------------------------------------------------------------
    def _create_critical_incidents_section(self, start_date, end_date):
        elements = []

        elements.append(Paragraph("🚨 Incidents Critiques", self.styles["SectionTitle"]))
        elements.append(Spacer(1, 10))

        critical = self.db.query(Incident).filter(
            Incident.timestamp >= start_date,
            Incident.timestamp <= end_date,
            Incident.severity.in_(["high", "critical"])
        ).order_by(Incident.score).limit(20).all()

        if not critical:
            elements.append(Paragraph("Aucun incident critique détecté.", self.styles["Normal"]))
            return elements

        table_data = [["Date", "Source", "Message", "Score"]]

        for inc in critical:
            msg = inc.message if len(inc.message) < 40 else inc.message[:40] + "..."
            table_data.append([
                inc.timestamp.strftime("%d/%m %H:%M"),
                inc.source,
                msg,
                f"{inc.score:.2f}",
            ])

        table = Table(table_data, colWidths=[1.2 * inch, 1.5 * inch, 3 * inch, 0.8 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dc2626")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
        ]))

        elements.append(table)
        return elements

    # ------------------------------------------------------------
    # ANALYSE PAR SOURCE
    # ------------------------------------------------------------
    def _create_source_analysis(self, start_date, end_date):
        elements = []

        elements.append(Paragraph("🔍 Analyse par Source", self.styles["SectionTitle"]))
        elements.append(Spacer(1, 10))

        stats = self.db.query(
            Incident.source,
            func.count(Incident.id).label("total"),
            func.sum(func.cast(Incident.severity.in_(["high", "critical"]), Integer)).label("high_count"),
            func.avg(Incident.score).label("avg_score")
        ).filter(
            Incident.timestamp >= start_date,
            Incident.timestamp <= end_date
        ).group_by(Incident.source).all()

        if not stats:
            elements.append(Paragraph("Aucune donnée disponible.", self.styles["Normal"]))
            return elements

        table_data = [["Source", "Total", "Critiques", "Score Moyen", "Risque"]]

        for s in stats:
            risk = "ÉLEVÉ" if s.high_count > 5 else "MOYEN" if s.high_count > 2 else "FAIBLE"
            table_data.append([
                s.source,
                str(s.total),
                str(s.high_count),
                f"{s.avg_score:.3f}",
                risk,
            ])

        table = Table(table_data, colWidths=[2 * inch, 1 * inch, 1 * inch, 1.2 * inch, 1.2 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0ea5e9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
        ]))

        elements.append(table)
        return elements

    # ------------------------------------------------------------
    # RECOMMANDATIONS
    # ------------------------------------------------------------
    def _create_recommendations(self, start_date, end_date):
        elements = []

        elements.append(Paragraph("💡 Recommandations", self.styles["SectionTitle"]))
        elements.append(Spacer(1, 10))

        incidents = self.db.query(Incident).filter(
            Incident.timestamp >= start_date,
            Incident.timestamp <= end_date
        ).all()

        high = sum(i.severity in ("high", "critical") for i in incidents)
        anomalies = sum(i.is_anomaly for i in incidents)

        recs = []

        if high > 10:
            recs.append("⚠️ Beaucoup d'incidents critiques détectés — intervention immédiate recommandée.")

        if anomalies > len(incidents) * 0.5:
            recs.append("🔍 Plus de 50% des incidents sont des anomalies — audit conseillé.")

        if not recs:
            recs.append("✅ Système stable — surveillance normale recommandée.")

        for r in recs:
            elements.append(Paragraph(r, self.styles["Normal"]))
            elements.append(Spacer(1, 10))

        return elements

    # ------------------------------------------------------------
    # GÉNÉRATION FINALE
    # ------------------------------------------------------------
    def generate_report(self, start_date, end_date, period):
        temp_dir = tempfile.gettempdir()
        pdf_filename = f"rapport_incidents_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_path = os.path.join(temp_dir, pdf_filename)

        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        story = []

        story.extend(self._create_cover_page(start_date, end_date, period))
        story.append(PageBreak())

        story.extend(self._create_executive_summary(start_date, end_date))
        story.append(PageBreak())

        story.extend(self._create_statistics_section(start_date, end_date))
        story.append(PageBreak())

        story.extend(self._create_charts_section(start_date, end_date))
        story.append(PageBreak())

        story.extend(self._create_critical_incidents_section(start_date, end_date))
        story.append(PageBreak())

        story.extend(self._create_source_analysis(start_date, end_date))
        story.append(PageBreak())

        story.extend(self._create_recommendations(start_date, end_date))

        doc.build(story)
        return pdf_path
