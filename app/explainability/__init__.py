"""
Explainability Module
=====================

Provides SHAP-based model explanations, feature mapping,
and human-readable narrative generation.
"""

from app.explainability.shap_explainer import SHAPExplainer
from app.explainability.feature_mapper import FeatureMapper
from app.explainability.narrative_generator import NarrativeGenerator


__all__ = [
    "SHAPExplainer",
    "FeatureMapper",
    "NarrativeGenerator",
]