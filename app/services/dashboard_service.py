from datetime import datetime, timezone


# ============================================
# TAMIL NADU DISTRICTS
# ============================================

TAMIL_NADU_DISTRICTS = [

    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kanchipuram",
    "Kanniyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "The Nilgiris",
    "Theni",
    "Thiruvallur",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Villupuram",
    "Virudhunagar",

]


# ============================================
# DASHBOARD SERVICE
# ============================================

class DashboardService:

    # ========================================
    # INITIAL EMPTY STATE
    # ========================================

    @staticmethod
    def empty_dashboard():

        return {

            "status": "success",

            "total_districts":
                len(
                    TAMIL_NADU_DISTRICTS
                ),

            "total_predictions":
                0,

            "risk_counts": {

                "HIGH": 0,

                "MEDIUM": 0,

                "LOW": 0,

            },

            "top_risk_districts":
                [],

            "latest_predictions":
                [],

            "last_updated":
                datetime.now(
                    timezone.utc
                ).isoformat(),

        }


    # ========================================
    # BUILD DASHBOARD DATA
    # ========================================

    @staticmethod
    def build_dashboard(
        predictions=None,
    ):

        if predictions is None:

            predictions = []


        # ====================================
        # RISK COUNTERS
        # ====================================

        high_count = 0

        medium_count = 0

        low_count = 0


        district_data = []


        for prediction in predictions:

            risk_level = str(

                prediction.get(
                    "risk_level",
                    "LOW"
                )

            ).upper()


            if risk_level == "HIGH":

                high_count += 1


            elif risk_level == "MEDIUM":

                medium_count += 1


            elif risk_level == "LOW":

                low_count += 1


            else:

                # Unknown risk levels are not
                # counted as LOW.
                pass


            district_data.append({

                "district":
                    prediction.get(
                        "district",
                        "Unknown"
                    ),

                "disease":
                    prediction.get(
                        "disease",
                        "Unknown"
                    ),

                "risk_level":
                    risk_level,

                "probability":
                    prediction.get(
                        "probability",
                        prediction.get(
                            "risk_probability",
                            0
                        )
                    ),

                "cases":
                    prediction.get(
                        "cases",
                        prediction.get(
                            "predicted_cases",
                            0
                        )
                    ),

                "updated_at":
                    prediction.get(
                        "updated_at",
                        prediction.get(
                            "generated_at",
                            None
                        )
                    ),

            })


        # ====================================
        # SORT BY PROBABILITY
        # ====================================

        district_data.sort(

            key=lambda item:

                float(
                    item.get(
                        "probability",
                        0
                    ) or 0
                ),

            reverse=True,

        )


        # ====================================
        # TOP 5 RISK DISTRICTS
        # ====================================

        top_risk_districts = (

            district_data[:5]

        )


        # ====================================
        # LATEST 10 PREDICTIONS
        # ====================================

        latest_predictions = (

            district_data[:10]

        )


        # ====================================
        # FINAL DASHBOARD STATE
        # ====================================

        return {

            "status":
                "success",

            "total_districts":
                len(
                    TAMIL_NADU_DISTRICTS
                ),

            "total_predictions":
                len(
                    predictions
                ),

            "risk_counts": {

                "HIGH":
                    high_count,

                "MEDIUM":
                    medium_count,

                "LOW":
                    low_count,

            },

            "top_risk_districts":
                top_risk_districts,

            "latest_predictions":
                latest_predictions,

            "last_updated":
                datetime.now(
                    timezone.utc
                ).isoformat(),

        }


# ============================================
# GLOBAL SERVICE INSTANCE
# ============================================

dashboard_service = (
    DashboardService()
)


# ============================================
# SHARED DASHBOARD PREDICTION PROVIDER
# ============================================

def get_dashboard_predictions():
    """
    Returns the latest district-level dashboard
    records for the Dashboard Agent and
    Dashboard WebSocket.

    Uses the existing dashboard prediction
    data source.

    Module 5 Prediction Engine remains on hold.
    """

    from app.api.v1.dashboard import (
        build_district_summary,
    )

    return build_district_summary()