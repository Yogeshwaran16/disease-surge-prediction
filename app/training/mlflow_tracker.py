import os

import mlflow
from mlflow import MlflowClient


# =========================================
# MLFLOW CONFIGURATION
# =========================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)

MLFLOW_DB = os.path.join(
    BASE_DIR,
    "mlflow.db"
)

MLFLOW_TRACKING_URI = (
    f"sqlite:///{MLFLOW_DB}"
)

mlflow.set_tracking_uri(
    MLFLOW_TRACKING_URI
)


EXPERIMENT_NAME = (
    "TECHNOVA_Model_Retraining"
)

REGISTERED_MODEL_NAME = (
    "TECHNOVA_Disease_Model"
)


# =========================================
# EXPERIMENT
# =========================================

def get_or_create_experiment():

    experiment = (
        mlflow.get_experiment_by_name(
            EXPERIMENT_NAME
        )
    )

    if experiment is not None:

        return experiment.experiment_id

    return mlflow.create_experiment(
        EXPERIMENT_NAME
    )


# =========================================
# LOG TRAINING RUN
# =========================================

def log_training_run(
    model_name: str,
    version: str,
    metrics: dict,
    training_records: int,
    dataset_hash: str,
    model_path: str | None = None,
    trigger_type: str = "MANUAL"
):

    experiment_id = (
        get_or_create_experiment()
    )

    with mlflow.start_run(
        experiment_id=experiment_id
    ):

        # ---------------------------------
        # TAGS
        # ---------------------------------

        mlflow.set_tag(
            "model_name",
            model_name
        )

        mlflow.set_tag(
            "model_version",
            version
        )

        mlflow.set_tag(
            "trigger_type",
            trigger_type
        )

        mlflow.set_tag(
            "dataset_hash",
            dataset_hash
        )

        # ---------------------------------
        # PARAMETERS
        # ---------------------------------

        mlflow.log_param(
            "training_records",
            training_records
        )

        # ---------------------------------
        # METRICS
        # ---------------------------------

        for metric_name, value in metrics.items():

            mlflow.log_metric(
                metric_name,
                float(value)
            )

        # ---------------------------------
        # MODEL ARTIFACT
        # ---------------------------------

        if (
            model_path
            and
            os.path.exists(model_path)
        ):

            mlflow.log_artifact(
                model_path,
                artifact_path="model"
            )

        # ---------------------------------
        # RUN ID
        # ---------------------------------

        run = mlflow.active_run()

        run_id = run.info.run_id

        return {
            "run_id": run_id,
            "experiment_id": experiment_id,
            "model_name": model_name,
            "version": version,
            "dataset_hash": dataset_hash,
            "metrics": metrics
        }


# =========================================
# REGISTER MODEL VERSION
# =========================================

def register_model_version(
    run_id: str,
    version: str,
    dataset_hash: str,
    metrics: dict
):

    client = MlflowClient()

    # ---------------------------------
    # CREATE REGISTERED MODEL
    # ---------------------------------

    try:

        client.get_registered_model(
            REGISTERED_MODEL_NAME
        )

    except Exception:

        client.create_registered_model(
            REGISTERED_MODEL_NAME
        )

    # ---------------------------------
    # CREATE MODEL VERSION
    # ---------------------------------

    model_uri = (
        f"runs:/{run_id}/model"
    )

    model_version = (
        client.create_model_version(

            name=REGISTERED_MODEL_NAME,

            source=model_uri,

            run_id=run_id
        )
    )

    # ---------------------------------
    # AUDIT TAGS
    # ---------------------------------

    client.set_model_version_tag(
        REGISTERED_MODEL_NAME,
        model_version.version,
        "custom_version",
        version
    )

    client.set_model_version_tag(
        REGISTERED_MODEL_NAME,
        model_version.version,
        "dataset_hash",
        dataset_hash
    )

    for metric_name, value in metrics.items():

        client.set_model_version_tag(
            REGISTERED_MODEL_NAME,
            model_version.version,
            metric_name,
            str(value)
        )

    return {
        "registered_model":
            REGISTERED_MODEL_NAME,

        "mlflow_version":
            model_version.version,

        "run_id":
            run_id,

        "custom_version":
            version,

        "dataset_hash":
            dataset_hash,

        "metrics":
            metrics
    }