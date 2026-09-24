import pandas as pd
import numpy as np

from app.training.retraining_pipeline import RetrainingPipeline


def main():
    np.random.seed(42)

    rows = 600

    reference_df = pd.DataFrame({
        "temperature": np.random.normal(30, 2, rows),
        "rainfall": np.random.normal(80, 20, rows),
        "humidity": np.random.normal(70, 5, rows),
        "population": np.random.randint(100000, 500000, rows),
        "disease": np.random.randint(0, 2, rows)
    })

    current_df = reference_df.copy()

    # Simulate new incoming records
    current_df["rainfall"] = current_df["rainfall"] + 5

    pipeline = RetrainingPipeline()

    result = pipeline.run(
        reference_df=reference_df,
        current_df=current_df,
        target_column="disease",
        new_record_count=600,
        model_name="technova_disease_model"
    )

    print("\n====================================")
    print("RETRAINING PIPELINE E2E TEST")
    print("====================================")

    print("Status:", result["status"])

    trigger = result["trigger"]

    print("Retraining Required:", trigger["retraining_required"])
    print("Triggers:", trigger["triggers"])
    print("New Records:", trigger["new_records"])
    print("Record Threshold:", trigger["record_threshold"])
    print("Max PSI:", trigger["max_psi"])
    print("PSI Threshold:", trigger["psi_threshold"])

    training = result["training"]

    print("\nCandidate Version:", training["version"])
    print("Dataset Hash:", training["dataset_hash"])
    print("F1 Score:", training["metrics"]["f1_score"])
    print("ROC-AUC:", training["metrics"]["roc_auc"])

    history = result["history"]

    print("\nHistory ID:", history["id"])
    print("History Trigger:", history["trigger_type"])
    print("Promotion Status:", history["promotion_status"])

    print("====================================")
    print("RETRAINING PIPELINE VERIFIED")
    print("====================================")


if __name__ == "__main__":
    main()