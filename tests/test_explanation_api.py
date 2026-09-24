"""
Tests for Explanation API
=========================

Tests FastAPI endpoints for SHAP-based
prediction explanations.
"""

import pandas as pd

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
from app.api.v1.explanations import router as explanations_router
from app.api.v1 import explanations


def create_test_model():
    """
    Create and train a small test model.
    """

    X, y = make_classification(
        n_samples=100,
        n_features=4,
        n_informative=3,
        n_redundant=0,
        random_state=42,
    )

    feature_names = [
        "temperature",
        "humidity",
        "rainfall",
        "previous_cases",
    ]

    X_df = pd.DataFrame(
        X,
        columns=feature_names,
    )

    model = RandomForestClassifier(
        n_estimators=20,
        random_state=42,
    )

    model.fit(X_df, y)

    return model, X_df


def create_test_app():
    """
    Create FastAPI application for testing.
    """

    app = FastAPI()

    app.include_router(
        explanations.router,
        prefix="/api/v1",
    )

    return app


def test_explanation_health_check():
    """
    Test explanation API health endpoint.
    """

    app = create_test_app()

    client = TestClient(app)

    response = client.get(
        "/api/v1/explanations/health"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"

    assert data["service"] == "explainability"


def test_generate_explanation():
    """
    Test SHAP explanation generation endpoint.
    """

    model, X_df = create_test_model()

    # Inject test model into API module
    explanations.prediction_model = model

    app = create_test_app()

    client = TestClient(app)

    features = X_df.iloc[0].to_dict()

    response = client.post(
        "/api/v1/explanations/",
        json={
            "prediction_id": "test-001",
            "risk_level": "HIGH",
            "features": features,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["prediction_id"] == "test-001"

    assert data["risk_level"] == "HIGH"

    assert "summary" in data

    assert "key_factors" in data

    assert len(data["key_factors"]) > 0

    assert data["metadata"]["explainer"] == "SHAP"