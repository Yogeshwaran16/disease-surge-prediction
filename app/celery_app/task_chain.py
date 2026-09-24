from celery import chain

from app.celery_app.tasks.agent_tasks import (
    prediction_agent,
    analysis_agent,
    recommendation_agent,
    alert_agent,
)


def build_prediction_alert_chain(payload: dict | None = None):
    """
    Builds the prediction-to-alert Celery workflow.

    Each stage is an independent Celery task. Results are passed
    through the Celery message queue rather than direct function calls.
    """
    initial_payload = payload or {}

    return chain(
        prediction_agent.s(initial_payload),
        analysis_agent.s(),
        recommendation_agent.s(),
        alert_agent.s(),
    )


def dispatch_prediction_alert_chain(payload: dict | None = None):
    """
    Dispatch the workflow asynchronously through Celery.
    """
    workflow = build_prediction_alert_chain(payload)
    return workflow.apply_async()
