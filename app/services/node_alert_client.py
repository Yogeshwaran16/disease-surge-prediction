import os
from pathlib import Path
import requests
from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ENV = PROJECT_ROOT / "backend" / ".env"

load_dotenv(BACKEND_ENV)


NODE_BACKEND_URL = os.getenv(
    "NODE_BACKEND_URL",
    "http://127.0.0.1:5000",
)

INTERNAL_SERVICE_SECRET = os.getenv(
    "TECHNOVA_INTERNAL_SERVICE_SECRET",
)


def trigger_alert_notification(alert_id: str) -> dict:
    if not INTERNAL_SERVICE_SECRET:
        raise RuntimeError(
            "TECHNOVA_INTERNAL_SERVICE_SECRET is not configured"
        )

    url = (
        f"{NODE_BACKEND_URL}"
        f"/api/alerts/internal/{alert_id}/notify"
    )

    response = requests.post(
        url,
        headers={
            "x-technova-internal-secret": INTERNAL_SERVICE_SECRET,
            "Content-Type": "application/json",
        },
        timeout=10,
    )

    response.raise_for_status()

    return response.json()
