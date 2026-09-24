import pandas as pd

from app.monitoring.trigger_monitor import check_retraining_trigger
from app.agents.training_agent import TrainingAgent
from app.models.retraining_history import retraining_history
from app.training.promotion_service import promote_candidate


class RetrainingPipeline:

    def __init__(self):
        self.training_agent = TrainingAgent()

    def run(
        self,
        reference_df: pd.DataFrame,
        current_df: pd.DataFrame,
        target_column: str,
        new_record_count: int,
        model_name: str = "technova_disease_model"
    ) -> dict:

        # 1. Check retraining triggers
        trigger_result = check_retraining_trigger(
            reference_df=reference_df,
            current_df=current_df,
            new_record_count=new_record_count
        )

        if not trigger_result["retraining_required"]:
            return {
                "status": "not_triggered",
                "message": "Retraining is not required",
                "trigger": trigger_result
            }

        # 2. Train candidate model
        training_result = self.training_agent.run(
            df=current_df,
            target_column=target_column,
            model_name=model_name,
            trigger_type="AUTO"
        )

        candidate_version = training_result["version"]

        # 3. Register candidate in local model registry
        from app.models.model_registry import model_registry

        model_registry.register_model(
            model_name=model_name,
            version=candidate_version,
            algorithm="XGBoost",
            status="challenger",
            metrics=training_result["metrics"],
            training_records=len(current_df),
            dataset_hash=training_result["dataset_hash"],
            model_path=training_result["model_path"]
        )

        # 4. Champion / challenger promotion
        promotion_result = promote_candidate(
            candidate_version=candidate_version
        )

        promoted = promotion_result["promoted"]

        promotion_status = (
            "promoted"
            if promoted
            else "rejected"
        )

        # 5. Record complete retraining history
        history_record = retraining_history.add_record(
            trigger_type="AUTO",
            trigger_details={
                "triggers": trigger_result["triggers"],
                "new_records": trigger_result["new_records"],
                "max_psi": trigger_result["max_psi"],
                "psi_threshold": trigger_result["psi_threshold"],
                "record_threshold": trigger_result["record_threshold"]
            },
            model_name=model_name,
            candidate_version=candidate_version,
            dataset_hash=training_result["dataset_hash"],
            training_records=len(current_df),
            metrics=training_result["metrics"],
            status="completed",
            promotion_status=promotion_status,
            notes=(
                "Automatic retraining completed and "
                f"candidate was {promotion_status}"
            )
        )

        return {
            "status": "retraining_completed",
            "trigger": trigger_result,
            "training": training_result,
            "promotion": promotion_result,
            "history": history_record
        }