"""
Model Loader
============

Loads the trained disease surge prediction model
and its feature scaler for SHAP explainability.
"""

from pathlib import Path
import joblib


# =====================================================
# PROJECT PATH
# =====================================================

BASE_DIR = Path(__file__).resolve().parents[2]

ML_DIR = BASE_DIR / "ml"

MODEL_PATH = ML_DIR / "model.pkl"

SCALER_PATH = ML_DIR / "scaler.pkl"


# =====================================================
# FEATURE ORDER
# =====================================================

FEATURES = [

    "rainfall_mm",

    "max_temperature_c",

    "total_calls",

    "fever_calls",

    "total_opd",

    "fever_opd",

    "occupancy_rate_pct",

    "paracetamol_strips_sold",

    "dengue_diagnostic_kits",

    "aedes_larval_index"
]


# =====================================================
# MODEL LOADER
# =====================================================

class ModelLoader:

    def __init__(self):

        self.model = None

        self.scaler = None


    def load(self):

        if not MODEL_PATH.exists():

            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}"
            )


        if not SCALER_PATH.exists():

            raise FileNotFoundError(
                f"Scaler not found: {SCALER_PATH}"
            )


        self.model = joblib.load(
            MODEL_PATH
        )

        self.scaler = joblib.load(
            SCALER_PATH
        )


        return (
            self.model,
            self.scaler
        )


# =====================================================
# SINGLETON LOADER
# =====================================================

model_loader = ModelLoader()