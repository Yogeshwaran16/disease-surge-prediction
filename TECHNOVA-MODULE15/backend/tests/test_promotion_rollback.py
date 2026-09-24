from app.models.model_registry import ModelRegistry
from app.training.promotion_service import promote_candidate, rollback_to_version


def main():
    registry = ModelRegistry()

    # Champion
    champion = registry.register_model(
        model_name="technova_disease_model",
        version="v1.0",
        algorithm="XGBoost",
        status="champion",
        metrics={
            "f1_score": 0.67,
            "roc_auc": 0.86
        },
        training_records=1000,
        dataset_hash="hash_v1"
    )

    # Challenger
    challenger = registry.register_model(
        model_name="technova_disease_model",
        version="v1.1",
        algorithm="XGBoost",
        status="challenger",
        metrics={
            "f1_score": 0.71,
            "roc_auc": 0.89
        },
        training_records=1500,
        dataset_hash="hash_v2"
    )

    print("\n====================================")
    print("PROMOTION + ROLLBACK E2E TEST")
    print("====================================")

    print("Champion:", champion["version"])
    print("Challenger:", challenger["version"])

    # Use service functions with the module-level registry
    from app.models import model_registry as registry_module

    registry_module.model_registry.models = registry.models

    promotion = promote_candidate(
        candidate_version="v1.1",
        minimum_delta=0.02
    )

    print("\nPromotion Result:", promotion["promoted"])
    print("Metric Delta:", promotion["decision"]["metric_delta"])
    print("Minimum Delta:", promotion["decision"]["minimum_delta"])

    assert promotion["promoted"] is True
    assert promotion["decision"]["metric_delta"] >= 0.02

    current = registry_module.model_registry.get_champion()

    print("Current Champion After Promotion:", current["version"])

    assert current["version"] == "v1.1"

    # Rollback
    rollback = rollback_to_version("v1.0")

    print("\nRollback Result:", rollback["rollback"])

    current = registry_module.model_registry.get_champion()

    print("Champion After Rollback:", current["version"])

    assert current["version"] == "v1.0"

    print("\n====================================")
    print("PROMOTION + ROLLBACK VERIFIED")
    print("====================================")


if __name__ == "__main__":
    main()