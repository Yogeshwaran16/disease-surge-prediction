from apscheduler.schedulers.background import BackgroundScheduler

from app.database.connection import SessionLocal
from app.models.report import Report
from app.reports.report_agent import ReportAgent


scheduler = BackgroundScheduler()

report_agent = ReportAgent()


def generate_scheduled_report(report_type: str):
    """
    Generate and persist a scheduled TECHNOVA report.
    """

    db = SessionLocal()

    try:
        payload = {
            "report_type": report_type,
            "prediction_summary": {},
            "weather_trends": [],
            "hospital_resources": [],
            "recommendations": [],
        }

        result = report_agent.generate(
            payload=payload,
            file_format="pdf",
        )

        report = Report(
            report_type=report_type,
            output_format=result["format"],
            filename=result["filename"],
            file_path=result["path"],
            status="generated",
        )

        db.add(report)
        db.commit()

        print(
            f"[REPORT SCHEDULER] "
            f"{report_type} report generated: "
            f"{result['filename']}"
        )

    except Exception as error:
        db.rollback()

        print(
            f"[REPORT SCHEDULER] "
            f"{report_type} report failed: "
            f"{error}"
        )

    finally:
        db.close()


def start_report_scheduler():

    if scheduler.running:
        return

    scheduler.add_job(
        generate_scheduled_report,
        "cron",
        hour=0,
        minute=0,
        args=["daily"],
        id="daily_report",
        replace_existing=True,
    )

    scheduler.add_job(
        generate_scheduled_report,
        "cron",
        day_of_week="mon",
        hour=0,
        minute=15,
        args=["weekly"],
        id="weekly_report",
        replace_existing=True,
    )

    scheduler.add_job(
        generate_scheduled_report,
        "cron",
        day=1,
        hour=0,
        minute=30,
        args=["monthly"],
        id="monthly_report",
        replace_existing=True,
    )

    scheduler.start()

    print("[REPORT SCHEDULER] Started")


def stop_report_scheduler():

    if scheduler.running:

        scheduler.shutdown(
            wait=False
        )

        print(
            "[REPORT SCHEDULER] Stopped"
        )
