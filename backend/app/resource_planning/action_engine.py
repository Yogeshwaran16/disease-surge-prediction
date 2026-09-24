def get_recommended_actions(
    risk_level: str,
    shortage_count: int,
):

    risk = (
        risk_level
        .upper()
        .strip()
    )


    actions = []


    # ============================================
    # CRITICAL
    # ============================================

    if risk == "CRITICAL":

        actions.extend([

            "Activate emergency disease response protocol",

            "Prepare emergency hospital beds immediately",

            "Deploy additional medical staff",

            "Keep ambulances on emergency standby",

            "Notify District Health Officer",

        ])


    # ============================================
    # HIGH
    # ============================================

    elif risk == "HIGH":

        actions.extend([

            "Increase hospital bed readiness",

            "Prepare additional medical staff",

            "Keep ambulances ready for deployment",

            "Increase disease surveillance",

        ])


    # ============================================
    # MEDIUM
    # ============================================

    elif risk == "MEDIUM":

        actions.extend([

            "Monitor disease trend daily",

            "Maintain reserve medical resources",

            "Review hospital capacity",

        ])


    # ============================================
    # LOW
    # ============================================

    else:

        actions.extend([

            "Continue normal disease surveillance",

            "Maintain current resource availability",

        ])


    # ============================================
    # SHORTAGE ACTION
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