import numpy as np
import pandas as pd

from app.agents.training_agent import (
    TrainingAgent
)


# =========================================
# CREATE SAMPLE DATA
# =========================================

np.random.seed(42)

rows = 600

df = pd.DataFrame({

    "temperature": np.random.normal(
        30, 2, rows
    ),

    "rainfall": np.random.normal(
        100, 20, rows
    ),

    "humidity": np.random.normal(
        70, 5, rows
    ),

    "population": np.random.randint(
        100000,
        500000,
        rows
    ),

    "disease": np.random.randint(
        0,
        2,
        rows
    )
})


# =========================================
# TRAINING AGENT
# =========================================

agent = TrainingAgent()

result = agent.run(

    df=df,

    target_column="disease",

    model_name="technova_disease_model",

    version="registry_test_v1",

    trigger_type="MANUAL"
)


# =========================================
# DISPLAY RESULT
# =========================================

print("\n====================================")
print("MLFLOW REGISTRY E2E TEST")
print("====================================")

print(
    "Model Name:",
    result["model_name"]
)

print(
    "Custom Version:",
    result["version"]
)

print(
    "Dataset Hash:",
    result["dataset_hash"]
)

print(
    "MLflow Run ID:",
    result["mlflow"]["run_id"]
)

print(
    "Experiment ID:",
    result["mlflow"]["experiment_id"]
)

print(
    "Registered Model:",
    result[
        "mlflow_registry"
    ]["registered_model"]
)

print(
    "MLflow Model Version:",
    result[
        "mlflow_registry"
    ]["mlflow_version"]
)

print(
    "F1 Score:",
    result[
        "metrics"
    ]["f1_score"]
)

print(
    "ROC-AUC:",
    result[
        "metrics"
    ]["roc_auc"]
)

print(
    "Model Path:",
    result["model_path"]
)

print("====================================")