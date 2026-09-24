from datetime import datetime, timezone

from app.training.trainer import CandidateTrainer
from app.training.dataset_hash import generate_dataset_hash
from app.training.mlflow_tracker import (
    log_training_run,
    register_model_version
)


class TrainingAgent:

    def __init__(self):

        self.trainer = CandidateTrainer()

    def run(
        self,
        df,
        target_column,
        model_name="technova_disease_model",
        version=None,
        trigger_type="MANUAL"
    ):
        """
        Train challenger model, log the run to MLflow,
        and register the model version.
        """

        # =========================================
        # VALIDATE DATASET
        # =========================================

        if df is None or df.empty:

            raise ValueError(
                "Training dataset is empty"
            )

        if target_column not in df.columns:

            raise ValueError(
                f"Target column '{target_column}' "
                "not found in dataset"
            )

        # =========================================
        # GENERATE VERSION
        # =========================================

        if version is None:

            version = (
                "candidate_"
                + datetime.utcnow().strftime(
                    "%Y%m%d%H%M%S"
                )
            )

        print("\n====================================")
        print("TECHNOVA SENTINEL AI")
        print("TRAINING AGENT")
        print("====================================")

        print(
            f"Training records : {len(df)}"
        )

        print(
            f"Target column    : {target_column}"
        )

        print(
            f"Model version    : {version}"
        )

        print(
            f"Trigger type     : {trigger_type}"
        )

        # =========================================
        # DATASET HASH
        # =========================================

        dataset_hash = generate_dataset_hash(
            df
        )

        print(
            f"Dataset hash     : {dataset_hash}"
        )

        # =========================================
        # TRAIN MODEL
        # =========================================

        result = self.trainer.train(

            df=df,

            target_column=target_column,

            model_name=model_name,

            version=version
        )

        # =========================================
        # MLFLOW TRAINING RUN
        # =========================================

        mlflow_result = log_training_run(

            model_name=model_name,

            version=version,

            metrics=result["metrics"],

            training_records=len(df),

            dataset_hash=dataset_hash,

            model_path=result["model_path"],

            trigger_type=trigger_type
        )

        # =========================================
        # MLFLOW MODEL REGISTRY
        # =========================================

        registry_result = register_model_version(

            run_id=mlflow_result["run_id"],

            version=version,

            dataset_hash=dataset_hash,

            metrics=result["metrics"]
        )

        # =========================================
        # ADD METADATA
        # =========================================

        result["dataset_hash"] = dataset_hash

        result["trained_at"] = (
            datetime.now(timezone.utc).isoformat()
        )

        result["trigger_type"] = trigger_type

        result["mlflow"] = mlflow_result

        result["mlflow_registry"] = (
            registry_result
        )

        # =========================================
        # DISPLAY RESULT
        # =========================================

        print("\n------------------------------------")
        print("TRAINING COMPLETED")
        print("------------------------------------")

        print(
            f"Model path       : "
            f"{result['model_path']}"
        )

        print(
            f"Dataset hash     : "
            f"{dataset_hash}"
        )

        print(
            f"MLflow Run ID    : "
            f"{mlflow_result['run_id']}"
        )

        print(
            f"MLflow Model     : "
            f"{registry_result['registered_model']}"
        )

        print(
            f"MLflow Version   : "
            f"{registry_result['mlflow_version']}"
        )

        print(
            f"Training records : "
            f"{result['training_records']}"
        )

        print(
            f"Test records     : "
            f"{result['test_records']}"
        )

        print(
            f"Precision        : "
            f"{result['metrics']['precision']:.4f}"
        )

        print(
            f"Recall           : "
            f"{result['metrics']['recall']:.4f}"
        )

        print(
            f"F1 Score         : "
            f"{result['metrics']['f1_score']:.4f}"
        )

        print(
            f"ROC-AUC          : "
            f"{result['metrics']['roc_auc']:.4f}"
        )

        print("------------------------------------")

        return result