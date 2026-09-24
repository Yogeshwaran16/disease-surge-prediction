import mlflow

from app.training.mlflow_tracker import REGISTERED_MODEL_NAME


def test_mlflow_registry_exists():
    client = mlflow.MlflowClient()

    try:
        model = client.get_registered_model(REGISTERED_MODEL_NAME)
    except Exception as exc:
        raise AssertionError(
            f"Registered Model '{REGISTERED_MODEL_NAME}' not found. "
            "Run test_mlflow_training.py first."
        ) from exc

    assert model.name == REGISTERED_MODEL_NAME