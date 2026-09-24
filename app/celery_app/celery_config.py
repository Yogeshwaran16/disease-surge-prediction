from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "technova",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.celery_app.tasks.agent_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,

    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,

    broker_connection_retry_on_startup=True,
    task_default_max_retries=3,
    task_default_retry_delay=10,
    task_default_retry_backoff=True,
    task_default_retry_backoff_max=300,

    task_routes={
        "technova.weather": {"queue": "weather"},
        "technova.data": {"queue": "data"},
        "technova.cleaning": {"queue": "cleaning"},
        "technova.data_quality": {"queue": "cleaning"},
        "technova.feature_engineering": {"queue": "feature_engineering"},
    "technova.training": {"queue": "training"},
        "technova.prediction": {"queue": "prediction"},
        "technova.analysis": {"queue": "analysis"},
        "technova.recommendation": {"queue": "recommendation"},
        "technova.report": {"queue": "report"},
        "technova.alert": {"queue": "alert"},
        "technova.alert_scan": {"queue": "alert"},
        "technova.dashboard": {"queue": "dashboard"},
        "technova.notification": {"queue": "notification"},
        "technova.health_monitor": {"queue": "health_monitor"},
        "technova.cleanup": {"queue": "cleanup"},
        "technova.agent_failure_alert": {"queue": "health_monitor"},
    },

    task_default_queue="default",

    beat_schedule_filename="celerybeat-schedule",
)

celery_app.autodiscover_tasks(["app.celery_app.tasks"])

from app.celery_app import beat_schedule
import app.celery_app.tasks.agent_tasks

