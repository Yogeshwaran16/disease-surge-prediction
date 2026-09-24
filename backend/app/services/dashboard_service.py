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
    "Kancheepuram",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivagangai",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar",
    "Kanyakumari",
    "Tiruvannamalai",
]


# ============================================
# DASHBOARD SERVICE
# ============================================

class DashboardService:

    # ========================================
    # NORMALIZE PREDICTION
    # ========================================

    @staticmethod
    def _normalize_prediction(item: dict) -> dict:

        probability = item.get(
            "surge_probability",
            item.get(
                "probability",
                item.get(
                    "risk_probability",
                    0,
                ),
            ),
        )

        if probability is None:
            probability = 0

        try:
            probability = float(probability)
        except (TypeError, ValueError):
            probability = 0

        # Convert percentage values such as 88 -> 0.88
        if probability > 1:
            probability = probability / 100

        probability = max(
            0,
            min(probability, 1),
        )

        # ------------------------------------
        # CASES
        # ------------------------------------

        cases = item.get(
            "expected_cases_2w",
            item.get(
                "predicted_cases",
                item.get(
                    "cases",
                    0,
                ),
            ),
        )

        # ------------------------------------
        # RISK
        # ------------------------------------

        risk_level = str(
            item.get(
                "risk_level",
                "LOW",
            )
        ).upper()

        # ------------------------------------
        # DISTRICT
        # ------------------------------------

        district = (
            item.get("district")
            or item.get("district_name")
            or "Unknown"
        )

        # ------------------------------------
        # DISEASE
        # ------------------------------------

        disease = item.get(
            "disease",
            "Unknown",
        )

        # ------------------------------------
        # UPDATED TIME
        # ------------------------------------

        updated_at = (
            item.get("updated_at")
            or item.get("generated_at")
            or datetime.now(
                timezone.utc
            ).isoformat()
        )

        return {
            "district": district,
            "disease": disease,
            "risk_level": risk_level,
            "probability": probability,
            "surge_probability": probability,
            "cases": cases,
            "predicted_cases": cases,
            "expected_cases_2w": cases,
            "updated_at": updated_at,
            "year": item.get("year"),
            "week_number": item.get(
                "week_number"
            ),
        }


    # ========================================
    # EMPTY DASHBOARD
    # ========================================

    @staticmethod
    def empty_dashboard():

        now = datetime.now(
            timezone.utc
        ).isoformat()

        district_data = []

        for district in TAMIL_NADU_DISTRICTS:

            district_data.append({

                "district": district,

                "disease": None,

                "risk_level": "NO_DATA",

                "probability": 0,

                "surge_probability": 0,

                "cases": 0,

                "predicted_cases": 0,

                "expected_cases_2w": 0,

                "updated_at": None,

                "year": None,

                "week_number": None,

            })

        return {

            "success": True,

            "status": "success",

            "total_districts":
                len(TAMIL_NADU_DISTRICTS),

            "total_predictions": 0,

            "risk_counts": {

                "HIGH": 0,

                "MEDIUM": 0,

                "LOW": 0,

                "CRITICAL": 0,

            },

            "district_data":
                district_data,

            "top_risk_districts": [],

            "latest_predictions": [],

            "last_updated": now,

        }


    # ========================================
    # BUILD DASHBOARD
    # ========================================

    @staticmethod
    def build_dashboard(
        predictions=None
    ):

        if predictions is None:
            predictions = []

        # ------------------------------------
        # NORMALIZE ALL PREDICTIONS
        # ------------------------------------

        normalized = [

            DashboardService
            ._normalize_prediction(item)

            for item in predictions

            if isinstance(item, dict)

        ]

        # ------------------------------------
        # RISK COUNTS
        # ------------------------------------

        risk_counts = {

            "HIGH": 0,

            "MEDIUM": 0,

            "LOW": 0,

            "CRITICAL": 0,

        }

        for item in normalized:

            risk = item[
                "risk_level"
            ]

            if risk in risk_counts:

                risk_counts[risk] += 1

        # ------------------------------------
        # SORT BY PROBABILITY
        # ------------------------------------

        sorted_predictions = sorted(

            normalized,

            key=lambda item:
                item["probability"],

            reverse=True,

        )

        # ------------------------------------
        # TOP RISK DISTRICTS
        # ------------------------------------

        top_risk_districts = (
            sorted_predictions[:10]
        )

        # ------------------------------------
        # LATEST PREDICTIONS
        # ------------------------------------

        latest_predictions = (
            normalized[:10]
        )

        # ------------------------------------
        # MAP PREDICTIONS BY DISTRICT
        # ------------------------------------

        prediction_by_district = {

            item["district"]
            .strip()
            .lower(): item

            for item in normalized

        }

        # ------------------------------------
        # BUILD FULL 38 DISTRICT DATA
        # ------------------------------------

        district_data = []

        for district in TAMIL_NADU_DISTRICTS:

            existing = (
                prediction_by_district.get(
                    district.lower()
                )
            )

            if existing:

                district_data.append(
                    existing
                )

            else:

                district_data.append({

                    "district":
                        district,

                    "disease":
                        None,

                    "risk_level":
                        "NO_DATA",

                    "probability":
                        0,

                    "surge_probability":
                        0,

                    "cases":
                        0,

                    "predicted_cases":
                        0,

                    "expected_cases_2w":
                        0,

                    "updated_at":
                        None,

                    "year":
                        None,

                    "week_number":
                        None,

                })

        # ------------------------------------
        # RESPONSE
        # ------------------------------------

        return {

            "success": True,

            "status": "success",

            "total_districts":
                len(TAMIL_NADU_DISTRICTS),

            "total_predictions":
                len(normalized),

            "risk_counts":
                risk_counts,

            "district_data":
                district_data,

            "top_risk_districts":
                top_risk_districts,

            "latest_predictions":
                latest_predictions,

            "last_updated":
                datetime.now(
                    timezone.utc
                ).isoformat(),

        }