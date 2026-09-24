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

    # No champion -> candidate becomes champion
    if champion is None:

        promoted = model_registry.update_status(
            candidate_version,
            "champion"
        )

        return {
            "promoted": True,
            "reason": "No existing champion model",
            "model": promoted
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

    # Candidate rejected
    if not decision["promote"]:

        rejected = model_registry.update_status(
            candidate_version,
            "rejected"
        )

        return {
            "promoted": False,
            "decision": decision,
            "model": rejected
        }

    # Archive current champion in DB
    previous_champion = model_registry.update_status(
        champion["version"],
        "archived"
    )

    # Promote candidate in DB
    new_champion = model_registry.update_status(
        candidate_version,
        "champion"
    )

    return {
        "promoted": True,
        "decision": decision,
        "previous_champion": previous_champion,
        "new_champion": new_champion
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

    previous_champion = None

    if current_champion is not None:

        previous_champion = model_registry.update_status(
            current_champion["version"],
            "archived"
        )

    new_champion = model_registry.update_status(
        version,
        "champion"
    )

    return {
        "rollback": True,
        "previous_champion": previous_champion,
        "new_champion": new_champion
    }
