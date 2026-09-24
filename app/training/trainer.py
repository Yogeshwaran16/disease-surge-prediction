import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    brier_score_loss,
)

from xgboost import XGBClassifier


class CandidateTrainer:

    def train(
        self,
        df: pd.DataFrame,
        target_column: str,
        model_name: str = "technova_disease_model",
        version: str = "candidate"
    ):

        # =========================================
        # VALIDATE DATASET
        # =========================================

        if df is None or df.empty:

            raise ValueError(
                "Training dataset is empty"
            )

        if target_column not in df.columns:

            raise ValueError(
                f"Target column '{target_column}' not found"
            )

        # =========================================
        # FEATURES AND TARGET
        # =========================================

        X = df.drop(
            columns=[target_column]
        )

        y = df[target_column]

        # Keep numeric features only
        X = X.select_dtypes(
            include=["number"]
        )

        if X.empty:

            raise ValueError(
                "No numeric features available"
            )

        # =========================================
        # CHECK TARGET
        # =========================================

        if y.nunique() < 2:

            raise ValueError(
                "Target column must contain at least "
                "two classes"
            )

        # =========================================
        # TRAIN / TEST SPLIT
        # =========================================

        X_train, X_test, y_train, y_test = (
            train_test_split(
                X,
                y,
                test_size=0.20,
                random_state=42,
                stratify=y
            )
        )

        # =========================================
        # XGBOOST MODEL
        # =========================================

        model = XGBClassifier(

            n_estimators=200,

            max_depth=5,

            learning_rate=0.05,

            subsample=0.8,

            colsample_bytree=0.8,

            random_state=42,

            eval_metric="logloss"
        )

        # =========================================
        # TRAIN
        # =========================================

        model.fit(
            X_train,
            y_train
        )

        # =========================================
        # PREDICTIONS
        # =========================================

        predictions = model.predict(
            X_test
        )

        probabilities = model.predict_proba(
            X_test
        )[:, 1]

        # =========================================
        # METRICS
        # =========================================

        metrics = {

            "precision": float(
                precision_score(
                    y_test,
                    predictions,
                    zero_division=0
                )
            ),

            "recall": float(
                recall_score(
                    y_test,
                    predictions,
                    zero_division=0
                )
            ),

            "f1_score": float(
                f1_score(
                    y_test,
                    predictions,
                    zero_division=0
                )
            ),

            "roc_auc": float(
                roc_auc_score(
                    y_test,
                    probabilities
                )
            ),

            "brier_score": float(
                brier_score_loss(
                    y_test,
                    probabilities
                )
            )
        }

        # =========================================
        # SAVE CHALLENGER MODEL
        # =========================================

        model_directory = os.path.join(
            "ml_models",
            "challengers"
        )

        os.makedirs(
            model_directory,
            exist_ok=True
        )

        model_path = os.path.join(
            model_directory,
            f"{model_name}_{version}.pkl"
        )

        joblib.dump(
            model,
            model_path
        )

        # =========================================
        # RETURN RESULT
        # =========================================

        return {

            "model_name": model_name,

            "version": version,

            "model_path": model_path,

            "training_records": len(
                X_train
            ),

            "test_records": len(
                X_test
            ),

            "metrics": metrics
        }