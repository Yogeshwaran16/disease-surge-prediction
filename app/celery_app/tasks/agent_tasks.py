from app.celery_app.celery_config import celery_app
from app.services.node_alert_client import trigger_alert_notification
import os
import requests

from app.database.connection import SessionLocal
from app.agent_monitoring.service import record_agent_success, record_agent_failure

AGENT_NAMES = [
    "ingestion_agent",
    "data_quality_agent",
    "feature_engineering_agent",
    "prediction_agent",
    "analysis_agent",
    "recommendation_agent",
    "alert_agent",
    "report_agent",
    "notification_agent",
    "health_monitor_agent",
    "cleanup_agent",
]


def _agent_task(agent_name: str, payload: dict | None = None) -> dict:
    """
    Generic task wrapper with persistent agent health tracking.

    Agents communicate through task payloads / database records.
    Direct agent-to-agent Python calls are intentionally avoided.
    """
    db = SessionLocal()

    try:
        result = {
            "agent": agent_name,
            "status": "completed",
            "payload": payload or {},
        }

        record_agent_success(db, agent_name)

        return result

    except Exception as error:
        record_agent_failure(db, agent_name, str(error))
        raise

    finally:
        db.close()


@celery_app.task(name="technova.alert")
def alert_agent(payload=None):
    """
    Trigger alert notification processing through the Node backend.
    """
    payload = payload or {}
    db = SessionLocal()

    try:
        alert_id = _extract_alert_id(payload)

        if not alert_id:
            error_message = "alert_id is required"
            record_agent_failure(db, "alert_agent", error_message)
            return {
                "agent": "alert_agent",
                "status": "failed",
                "error": error_message,
            }
        result = trigger_alert_notification(
            alert_id=str(alert_id),        )

        record_agent_success(db, "alert_agent")

        return {
            "agent": "alert_agent",
            "status": "completed",
            "alert_id": str(alert_id),
            "notification": result,
        }

    except Exception as error:
        record_agent_failure(db, "alert_agent", str(error))
        agent_failure_alert.delay(
            "alert_agent",
            str(error),
        )
        return {
            "agent": "alert_agent",
            "status": "failed",
            "alert_id": str(payload.get("alert_id")) if payload.get("alert_id") else None,
            "error": str(error),
        }

    finally:
        db.close()


@celery_app.task(name="technova.notification")
def notification_agent(payload=None):
    """
    Trigger notification delivery for an existing alert.
    """
    payload = payload or {}
    db = SessionLocal()

    try:
        alert_id = _extract_alert_id(payload)

        if not alert_id:
            error_message = "alert_id is required"
            record_agent_failure(db, "notification_agent", error_message)
            return {
                "agent": "notification_agent",
                "status": "failed",
                "error": error_message,
            }
        result = trigger_alert_notification(
            alert_id=str(alert_id),        )

        record_agent_success(db, "notification_agent")

        return {
            "agent": "notification_agent",
            "status": "completed",
            "alert_id": str(alert_id),
            "notification": result,
        }

    except Exception as error:
        record_agent_failure(db, "notification_agent", str(error))
        agent_failure_alert.delay(
            "notification_agent",
            str(error),
        )
        return {
            "agent": "notification_agent",
            "status": "failed",
            "alert_id": str(payload.get("alert_id")) if payload.get("alert_id") else None,
            "error": str(error),
        }

    finally:
        db.close()


@celery_app.task(name="technova.data_quality")
def data_quality_agent(payload=None):
    return _agent_task("data_quality_agent", payload)


@celery_app.task(name="technova.feature_engineering")
def feature_engineering_agent(payload=None):
    db = SessionLocal()

    try:
        from app.services.feature_engineering_runner import run_feature_engineering

        result = run_feature_engineering()

        record_agent_success(db, "feature_engineering_agent")

        return {
            "agent": "feature_engineering_agent",
            "status": "completed",
            "result": result,
        }

    except Exception as error:
        record_agent_failure(db, "feature_engineering_agent", str(error))
        return {
            "agent": "feature_engineering_agent",
            "status": "failed",
            "error": str(error),
        }

    finally:
        db.close()

@celery_app.task(name="technova.training")
def training_agent(payload=None):
    db = SessionLocal()

    try:
        from pathlib import Path
        import pandas as pd
        from app.agents.training_agent import TrainingAgent

        project_root = Path(__file__).resolve().parents[3]
        dataset_path = project_root / "ml" / "merged_dataset.csv"

        if not dataset_path.exists():
            raise FileNotFoundError(f"Training dataset not found: {dataset_path}")

        df = pd.read_csv(dataset_path)
        target_column = (payload or {}).get("target_column", "surge")
        model_name = (payload or {}).get("model_name", "technova_disease_model")

        agent = TrainingAgent()
        result = agent.run(
            df=df,
            target_column=target_column,
            model_name=model_name,
            trigger_type="SCHEDULED"
        )

        record_agent_success(db, "training_agent")

        return {
            "agent": "training_agent",
            "status": "completed",
            "result": result,
        }

    except Exception as error:
        record_agent_failure(db, "training_agent", str(error))
        return {
            "agent": "training_agent",
            "status": "failed",
            "error": str(error),
        }

    finally:
        db.close()



@celery_app.task(name="technova.prediction")
def prediction_agent(payload=None):
    return _agent_task("prediction_agent", payload)


@celery_app.task(name="technova.analysis")
def analysis_agent(payload=None):
    return _agent_task("analysis_agent", payload)


@celery_app.task(name="technova.recommendation")
def recommendation_agent(payload=None):
    return _agent_task("recommendation_agent", payload)


@celery_app.task(name="technova.report")
def report_agent(payload=None):
    return _agent_task("report_agent", payload)


@celery_app.task(name="technova.health_monitor")
def health_monitor_agent(payload=None):
    return _agent_task("health_monitor_agent", payload)


@celery_app.task(name="technova.cleanup")
def cleanup_agent(payload=None):
    return _agent_task("cleanup_agent", payload)


@celery_app.task(name="technova.agent_failure_alert")
def agent_failure_alert(agent_name, error_message):
    return {
        "event": "agent_failure",
        "agent": agent_name,
        "status": "failed",
        "error": error_message,
    }


@celery_app.task(name="technova.dashboard")
def dashboard_agent_task(payload=None):
    """
    Celery wrapper for the existing Dashboard Agent.
    Uses the existing dashboard prediction provider.
    """
    db = SessionLocal()

    try:
        from app.agents.dashboard_agent import dashboard_agent
        from app.services.dashboard_service import get_dashboard_predictions

        predictions = get_dashboard_predictions()

        result = dashboard_agent.get_dashboard_data(
            predictions
        )

        record_agent_success(
            db,
            "dashboard_agent"
        )

        return {
            "agent": "dashboard_agent",
            "status": "completed",
            "result": result
        }

    except Exception as error:
        record_agent_failure(
            db,
            "dashboard_agent",
            str(error)
        )

        return {
            "agent": "dashboard_agent",
            "status": "failed",
            "error": str(error)
        }

    finally:
        db.close()


@celery_app.task(name="technova.alert_scan")
def alert_scan():
    """
    Automatically scan latest predictions and generate alerts.
    Called by Celery Beat every 5 minutes.
    """
    node_backend_url = os.getenv(
        "NODE_BACKEND_URL",
        "http://127.0.0.1:5000"
    )

    url = f"{node_backend_url}/api/alerts/scan-internal"

    db = SessionLocal()

    try:
        response = requests.post(
            url,
            headers={
                "Content-Type": "application/json"
            },
            timeout=30
        )

        response.raise_for_status()

        record_agent_success(db, "alert_scan_agent")

        return {
            "agent": "alert_scan_agent",
            "status": "completed",
            "result": response.json()
        }

    except Exception as error:
        record_agent_failure(
            db,
            "alert_scan_agent",
            str(error)
        )

        return {
            "agent": "alert_scan_agent",
            "status": "failed",
            "error": str(error)
        }

    finally:
        db.close()

from app.celery_app.celery_config import celery_app
from app.api.v1.data_source import DATA_SOURCE_REGISTRY, get_dataset_metadata

@celery_app.task(name="technova.data")
def data_agent(payload=None):
    payload = payload or {}

    sources = [
        get_dataset_metadata(source)
        for source in DATA_SOURCE_REGISTRY
    ]

    active_sources = [
        source for source in sources
        if source["status"] == "ACTIVE"
    ]

    return {
        "agent": "data_agent",
        "status": "completed",
        "total_sources": len(sources),
        "active_sources": len(active_sources),
        "sources": [
            {
                "data_category": source["data_category"],
                "filename": source["filename"],
                "status": source["status"],
                "last_updated": source["last_updated"],
                "historical_available": source["historical_available"],
                "current_available": source["current_available"],
            }
            for source in active_sources
        ],
    }
@celery_app.task(name="technova.cleaning")
def cleaning_agent(payload=None):
    import pandas as pd

    db = SessionLocal()

    try:
        from app.api.v1.data_source import DATA_DIR, DATA_SOURCE_REGISTRY

        results = []

        for source in DATA_SOURCE_REGISTRY:
            file_path = DATA_DIR / source["filename"]

            if not file_path.exists():
                results.append({
                    "data_category": source["data_category"],
                    "filename": source["filename"],
                    "status": "MISSING",
                    "rows": 0,
                    "missing_values": 0,
                    "duplicate_rows": 0,
                })
                continue

            try:
                dataframe = pd.read_csv(file_path)

                missing_values = int(dataframe.isna().sum().sum())
                duplicate_rows = int(dataframe.duplicated().sum())

                status = (
                    "CLEAN"
                    if missing_values == 0 and duplicate_rows == 0
                    else "REQUIRES_CLEANING"
                )

                results.append({
                    "data_category": source["data_category"],
                    "filename": source["filename"],
                    "status": status,
                    "rows": int(len(dataframe)),
                    "missing_values": missing_values,
                    "duplicate_rows": duplicate_rows,
                })

            except Exception as error:
                results.append({
                    "data_category": source["data_category"],
                    "filename": source["filename"],
                    "status": "INVALID",
                    "rows": 0,
                    "missing_values": 0,
                    "duplicate_rows": 0,
                    "error": str(error),
                })

        record_agent_success(db, "cleaning_agent")

        return {
            "agent": "cleaning_agent",
            "status": "completed",
            "total_sources": len(results),
            "results": results,
        }

    except Exception as error:
        record_agent_failure(
            db,
            "cleaning_agent",
            str(error)
        )

        return {
            "agent": "cleaning_agent",
            "status": "failed",
            "error": str(error),
        }

    finally:
        db.close()
@celery_app.task(name="technova.weather")
def weather_agent(payload=None):
    """
    Autonomous Weather Agent.

    Reads the existing IMD rainfall and temperature datasets
    and produces district-level latest weather observations.
    """
    import pandas as pd

    db = SessionLocal()

    try:
        from app.api.v1.data_source import DATA_DIR

        rainfall_file = DATA_DIR / "TamilNadu_IMD_Rainfall_2015_2025.csv"
        temperature_file = DATA_DIR / "TamilNadu_IMD_MaxTemperature_2015_2025.csv"

        rainfall = pd.read_csv(rainfall_file)
        temperature = pd.read_csv(temperature_file)

        rainfall["date"] = pd.to_datetime(
            rainfall["date"],
            errors="coerce"
        )
        temperature["date"] = pd.to_datetime(
            temperature["date"],
            errors="coerce"
        )

        rainfall = rainfall.dropna(
            subset=["date", "district", "rainfall_mm"]
        )
        temperature = temperature.dropna(
            subset=["date", "district", "max_temperature_c"]
        )

        latest_rainfall = (
            rainfall.sort_values("date")
            .groupby("district", as_index=False)
            .tail(1)
        )

        latest_temperature = (
            temperature.sort_values("date")
            .groupby("district", as_index=False)
            .tail(1)
        )

        weather = latest_rainfall[
            ["district", "date", "rainfall_mm"]
        ].merge(
            latest_temperature[
                ["district", "date", "max_temperature_c"]
            ],
            on="district",
            how="outer",
            suffixes=("_rainfall", "_temperature")
        )

        weather["date"] = (
            weather["date_rainfall"]
            .fillna(weather["date_temperature"])
        )

        records = []

        for _, row in weather.iterrows():
            records.append({
                "district": row["district"],
                "date": (
                    row["date"].strftime("%Y-%m-%d")
                    if pd.notna(row["date"])
                    else None
                ),
                "rainfall_mm": (
                    float(row["rainfall_mm"])
                    if pd.notna(row["rainfall_mm"])
                    else None
                ),
                "max_temperature_c": (
                    float(row["max_temperature_c"])
                    if pd.notna(row["max_temperature_c"])
                    else None
                ),
            })

        record_agent_success(
            db,
            "weather_agent"
        )

        return {
            "agent": "weather_agent",
            "status": "completed",
            "districts_processed": len(records),
            "rainfall_records": int(len(rainfall)),
            "temperature_records": int(len(temperature)),
            "latest_weather": records,
        }

    except Exception as error:
        record_agent_failure(
            db,
            "weather_agent",
            str(error)
        )

        return {
            "agent": "weather_agent",
            "status": "failed",
            "error": str(error),
        }

    finally:
        db.close()

def _extract_alert_id(payload):
    current = payload

    for _ in range(10):
        if not isinstance(current, dict):
            return None

        if current.get("alert_id"):
            return current["alert_id"]

        current = current.get("payload")

    return None


