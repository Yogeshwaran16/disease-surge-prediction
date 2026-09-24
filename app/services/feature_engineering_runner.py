import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = PROJECT_ROOT / "ml" / "feature_engineering.py"

def run_feature_engineering():
    result = subprocess.run(
        [sys.executable, str(SCRIPT)],
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            "Feature engineering failed:\n"
            + result.stderr
        )

    return {
        "status": "completed",
        "script": str(SCRIPT),
        "output": result.stdout[-3000:],
    }
