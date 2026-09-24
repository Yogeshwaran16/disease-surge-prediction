from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.report import Report
from app.reports.report_agent import ReportAgent


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)

report_agent = ReportAgent()


class ReportGenerateRequest(BaseModel):
    report_type: str = Field(default="on_demand")
    output_format: str = Field(default="json")

    prediction_summary: dict[str, Any] = Field(default_factory=dict)
    weather_trends: list[dict[str, Any]] = Field(default_factory=list)
    hospital_resources: list[dict[str, Any]] = Field(default_factory=list)
    recommendations: list[Any] = Field(default_factory=list)


@router.post("/generate")
def generate_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
):
    try:
        payload = {
            "report_type": request.report_type,
            "prediction_summary": request.prediction_summary,
            "weather_trends": request.weather_trends,
            "hospital_resources": request.hospital_resources,
            "recommendations": request.recommendations,
        }

        result = report_agent.generate(
            payload=payload,
            file_format=request.output_format,
        )

        report = Report(
            report_type=request.report_type,
            output_format=result["format"],
            filename=result["filename"],
            file_path=result["path"],
            status="generated",
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        return {
            "success": True,
            "report_id": report.id,
            "report_type": report.report_type,
            "format": report.output_format,
            "filename": report.filename,
            "status": report.status,
            "created_at": report.created_at,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {error}",
        )


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id)
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    file_path = Path(report.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Report file not found",
        )

    return FileResponse(
        path=file_path,
        filename=report.filename,
    )


@router.get("")
def list_reports(
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .order_by(Report.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(reports),
        "reports": [
            {
                "id": report.id,
                "report_type": report.report_type,
                "format": report.output_format,
                "filename": report.filename,
                "status": report.status,
                "created_at": report.created_at,
                "download_url": (
                    f"/api/v1/reports/"
                    f"{report.id}/download"
                ),
            }
            for report in reports
        ],
    }
