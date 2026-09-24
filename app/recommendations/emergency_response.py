"""
Emergency Response Service
==========================

Handles actions after emergency escalation:

- District Health Officer notification
- Emergency resource transfer request
- Emergency response record generation
"""


from datetime import datetime


class EmergencyResponseService:
    """
    Generates emergency response actions
    after an outbreak escalation.
    """


    def generate_response(
        self,
        district: str,
        disease: str,
        outbreak_probability: float,
        confidence: float,
        escalation_result: dict,
    ) -> dict:
        """
        Generate emergency response.

        Only generates emergency actions when
        emergency escalation is active.
        """

        if not escalation_result.get(
            "emergency_escalated",
            False,
        ):

            return {
                "emergency_active": False,
                "message": (
                    "Emergency escalation has not "
                    "been triggered."
                ),
                "notification": None,
                "resource_transfer_request": None,
            }

        notification = self._create_dho_notification(
            district=district,
            disease=disease,
            outbreak_probability=outbreak_probability,
            confidence=confidence,
        )

        resource_request = (
            self._create_resource_transfer_request(
                district=district,
                disease=disease,
            )
        )

        return {
            "emergency_active": True,

            "status": "EMERGENCY_RESPONSE",

            "district": district,

            "disease": disease,

            "created_at":
                datetime.utcnow().isoformat(),

            "notification":
                notification,

            "resource_transfer_request":
                resource_request,
        }


    def _create_dho_notification(
        self,
        district: str,
        disease: str,
        outbreak_probability: float,
        confidence: float,
    ) -> dict:
        """
        Create District Health Officer
        emergency notification.
        """

        message = (
            f"EMERGENCY ALERT: {disease.upper()} "
            f"outbreak risk in {district}. "
            f"Outbreak probability is "
            f"{outbreak_probability:.2%} and "
            f"prediction confidence is "
            f"{confidence:.2%}. "
            f"Immediate emergency response "
            f"is recommended."
        )

        return {
            "recipient_role":
                "District Health Officer",

            "district":
                district,

            "priority":
                "CRITICAL",

            "message":
                message,

            "status":
                "PENDING_DELIVERY",
        }


    def _create_resource_transfer_request(
        self,
        district: str,
        disease: str,
    ) -> dict:
        """
        Pre-draft emergency resource
        transfer request.
        """

        resources = self._get_resources(
            disease=disease,
        )

        return {
            "request_type":
                "EMERGENCY_RESOURCE_TRANSFER",

            "district":
                district,

            "disease":
                disease,

            "priority":
                "CRITICAL",

            "status":
                "DRAFT",

            "requested_resources":
                resources,

            "message": (
                f"Emergency resource transfer "
                f"requested for {disease.upper()} "
                f"outbreak preparedness in "
                f"{district}."
            ),
        }


    def _get_resources(
        self,
        disease: str,
    ) -> list:
        """
        Return disease-specific emergency
        resource recommendations.
        """

        disease = disease.lower()

        resource_map = {

            "dengue": [

                {
                    "resource":
                        "Dengue diagnostic kits",

                    "quantity":
                        "500 units",
                },

                {
                    "resource":
                        "IV fluids",

                    "quantity":
                        "1000 units",
                },

                {
                    "resource":
                        "Fogging machines",

                    "quantity":
                        "10 units",
                },

                {
                    "resource":
                        "Health workers",

                    "quantity":
                        "20 personnel",
                },
            ],


            "malaria": [

                {
                    "resource":
                        "Malaria rapid test kits",

                    "quantity":
                        "500 units",
                },

                {
                    "resource":
                        "Antimalarial medicines",

                    "quantity":
                        "1000 courses",
                },

                {
                    "resource":
                        "Mosquito control teams",

                    "quantity":
                        "10 teams",
                },
            ],


            "chikungunya": [

                {
                    "resource":
                        "Diagnostic kits",

                    "quantity":
                        "300 units",
                },

                {
                    "resource":
                        "Pain relief medicines",

                    "quantity":
                        "1000 units",
                },

                {
                    "resource":
                        "Health workers",

                    "quantity":
                        "15 personnel",
                },
            ],
        }


        return resource_map.get(

            disease,

            [

                {
                    "resource":
                        "Emergency medical supplies",

                    "quantity":
                        "As required",
                },

                {
                    "resource":
                        "Health workers",

                    "quantity":
                        "10 personnel",
                },
            ],
        )