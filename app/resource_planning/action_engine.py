from app.recommendations.action_matrix import (
    get_actions_for_risk,
)


def get_recommended_actions(
    risk_level: str,
    shortage_count: int,
):
    """
    Generate Resource Planning recommendations by reusing
    the central Recommendation Engine risk-action matrix.

    Resource-specific shortage actions are appended separately.
    """

    risk = (
        str(risk_level)
        .upper()
        .strip()
    )

    # ============================================
    # RECOMMENDATION ENGINE ACTIONS
    # ============================================

    matrix_actions = get_actions_for_risk(risk)

    actions = []

    for item in matrix_actions:

        action = item.get("action")

        if action:
            actions.append(action)

    # ============================================
    # RESOURCE SHORTAGE ACTIONS
    # ============================================

    if shortage_count > 0:

        actions.append(
            f"Resource shortage detected in "
            f"{shortage_count} category/categories"
        )

        actions.append(
            "Request additional resources "
            "from nearby districts"
        )

    return actions