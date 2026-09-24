from celery import shared_task

from app.agents.training_agent import TrainingAgent

from app.models.retraining_history import (
    retraining_history
)


@shared_task(
    bind=True,
    name="technova.retrain_model"
)
def retrain_model(
    self,
    dataset_path: str,
    target_column: str,
    model_name: str = "technova_disease_model",
    trigger_type: str = "MANUAL",
    trigger_details: dict | None = None
):
    """
    Celery background task for model retraining.

    The task:
    1. Loads the validated dataset
    2. Trains a challenger model
    3. Generates dataset hash
    4. Records metrics
    5. Stores retraining history
    """

    try:

        print("\n====================================")
        print("TECHNOVA RETRAINING TASK")
        print("====================================")

        print(
            f"Dataset       : {dataset_path}"
        )

        print(
            f"Target        : {target_column}"
        )

        print(
            f"Trigger       : {trigger_type}"
        )

        import pandas as pd

        df = pd.read_csv(
            dataset_path
        )

        if df.empty:

            raise ValueError(
                "Training dataset is empty"
            )

        agent = TrainingAgent()

        result = agent.run(
            df=df,
            target_column=target_column,
            model_name=model_name
        )

        candidate_version = result[
            "version"
        ]

        dataset_hash = result[
            "dataset_hash"
        ]

        metrics = result[
            "metrics"
        ]

        if trigger_details is None:

            trigger_details = {}

        # =========================================
        # RECORD RETRAINING HISTORY
        # =========================================

        history_record = (
            retraining_history.add_record(

                trigger_type=trigger_type,

                trigger_details=trigger_details,

                model_name=model_name,

                candidate_version=candidate_version,

                dataset_hash=dataset_hash,

                training_records=len(df),

                metrics=metrics,

                status="completed",

                promotion_status="pending",

                notes=(
                    "Candidate model trained "
                    "successfully"
                )
            )
        )

        print("\n====================================")
        print("RETRAINING HISTORY RECORDED")
        print("====================================")

        print(
            f"History ID     : "
            f"{history_record['id']}"
        )

        print(
            f"Candidate      : "
            f"{candidate_version}"
        )

        print(
            f"Dataset Hash   : "
            f"{dataset_hash}"
        )

        print(
            f"F1 Score       : "
            f"{metrics['f1_score']:.4f}"
        )

        print("------------------------------------")

        return {
            "status": "completed",
            "result": result,
            "history": history_record
        }

    except Exception as exc:

        print(
            f"Retraining failed: {exc}"
        )

        raise