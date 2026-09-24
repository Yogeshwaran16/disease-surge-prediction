def get_priority(
    risk_level: str,
    shortage_count: int,
):

    risk = (
        risk_level
        .upper()
        .strip()
    )


    # ============================================
    # CRITICAL PRIORITY
    # ============================================

    if risk == "CRITICAL":

        return {

            "priority":
                "EMERGENCY",

            "color":
                "RED",

            "response_time":
                "IMMEDIATE",

        }


    # ============================================
    # HIGH RISK
    # ============================================

    if risk == "HIGH":

        if shortage_count > 0:

            return {

                "priority":
                    "URGENT",

                "color":
                    "ORANGE",

                "response_time":
                    "WITHIN 6 HOURS",

            }


        return {

            "priority":
                "HIGH",

            "color":
                "ORANGE",

            "response_time":
                "WITHIN 24 HOURS",

        }


    # ============================================
    # MEDIUM RISK
    # ============================================

    if risk == "MEDIUM":

        return {

            "priority":
                "MODERATE",

            "color":
                "YELLOW",

            "response_time":
                "WITHIN 48 HOURS",

        }


    # ============================================
    # LOW RISK
    # ============================================

    return {

        "priority":
            "NORMAL",

        "color":
            "GREEN",

        "response_time":
            "ROUTINE MONITORING",

    }