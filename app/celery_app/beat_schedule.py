from app.celery_app.celery_config import celery_app

celery_app.conf.beat_schedule = {
    # 1. Weather Agent
    "weather-agent-every-15-min": {
        "task": "technova.weather",
        "schedule": 900.0,
    },

    # 2. Data Agent
    "data-agent-every-15-min": {
        "task": "technova.data",
        "schedule": 900.0,
    },

    # 3. Cleaning Agent
    "cleaning-agent-every-30-min": {
        "task": "technova.cleaning",
        "schedule": 1800.0,
    },

    # 4. Feature Engineering Agent
    "feature-engineering-agent-hourly": {
        "task": "technova.feature_engineering",
        "schedule": 3600.0,
    },

    # 5. Training Agent
    "training-agent-daily": {
        "task": "technova.training",
        "schedule": 86400.0,
    },

    # 6. Prediction Agent
    "prediction-agent-hourly": {
        "task": "technova.prediction",
        "schedule": 3600.0,
    },

    # 7. Analysis Agent
    "analysis-agent-hourly": {
        "task": "technova.analysis",
        "schedule": 3600.0,
    },

    # 8. Recommendation Agent
    "recommendation-agent-hourly": {
        "task": "technova.recommendation",
        "schedule": 3600.0,
    },

    # 9. Report Agent
    "report-agent-daily": {
        "task": "technova.report",
        "schedule": 86400.0,
    },

    # 10. Alert Agent
    "alert-agent-every-5-min": {
        "task": "technova.alert_scan",
        "schedule": 300.0,
    },

    # 11. Dashboard Agent
    "dashboard-agent-every-5-min": {
        "task": "technova.dashboard",
        "schedule": 300.0,
    },
}
