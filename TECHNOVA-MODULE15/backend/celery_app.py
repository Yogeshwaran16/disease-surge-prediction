import os

from celery import Celery
from dotenv import load_dotenv


load_dotenv()


BROKER_URL = os.getenv(
    "CELERY_BROKER_URL",
    "redis://localhost:6379/0"
)

RESULT_BACKEND = os.getenv(
    "CELERY_RESULT_BACKEND",
    "redis://localhost:6379/0"
)


celery_app = Celery(
    "technova",
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
    include=[
        "app.tasks.retraining_tasks"
    ]
)


celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)