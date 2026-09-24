from app.models.model_registry import model_registry
from app.training.promotion import should_promote


def promote_candidate(
    candidate_version: str,
    minimum_delta: float = 0.02
) -> dict:

    candidate = model_registry.get_model(
        candidate_version
    )

    if candidate is None:
        raise ValueError(
            "Candidate model not found"
        )

    champion = model_registry.get_champion()

    if champion is None:
        candidate["status"] = "champion"

        return {
            "promoted": True,
            "reason": "No existing champion model",
            "model": candidate
        }

    champion_metric = float(
        champion["metrics"]["f1_score"]
    )

    candidate_metric = float(
        candidate["metrics"]["f1_score"]
    )

    decision = should_promote(
        champion_metric=champion_metric,
        candidate_metric=candidate_metric,
        minimum_delta=minimum_delta
    )

    if not decision["promote"]:

        candidate["status"] = "rejected"

        return {
            "promoted": False,
            "decision": decision,
            "model": candidate
        }

    # Archive current champion
    champion["status"] = "archived"

    # Promote candidate
    candidate["status"] = "champion"

    candidate["promotion_reason"] = (
        decision["reason"]
    )

    return {
        "promoted": True,
        "decision": decision,
        "previous_champion": champion,
        "new_champion": candidate
    }


def rollback_to_version(
    version: str
) -> dict:

    target = model_registry.get_model(
        version
    )

    if target is None:
        raise ValueError(
            "Rollback target not found"
        )

    current_champion = (
        model_registry.get_champion()
    )

    if current_champion is not None:
        current_champion["status"] = "archived"

    target["status"] = "champion"

    return {
        "rollback": True,
        "previous_champion": current_champion,
        "new_champion": target
    }