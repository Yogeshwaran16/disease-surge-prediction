"""
Emergency Escalation Engine
===========================

Triggers Emergency Response when:

- Outbreak probability >= 0.85
- Confidence >= 0.80
- Conditions occur for two consecutive
  prediction cycles for the same district
  and disease.
"""


class EmergencyEscalationEngine:

    PROBABILITY_THRESHOLD = 0.85

    CONFIDENCE_THRESHOLD = 0.80

    REQUIRED_CONSECUTIVE_CYCLES = 2


    def __init__(self):

        # Temporary in-memory prediction history.
        # Database storage will be added later.
        self.prediction_history = {}


    def evaluate(
        self,
        district: str,
        disease: str,
        outbreak_probability: float,
        confidence: float,
    ) -> dict:
        """
        Evaluate whether emergency escalation
        should be triggered.
        """

        key = self._build_key(
            district=district,
            disease=disease,
        )

        qualifies = self._qualifies(
            outbreak_probability=outbreak_probability,
            confidence=confidence,
        )

        consecutive_count = (
            self._update_consecutive_count(
                key=key,
                qualifies=qualifies,
            )
        )

        escalated = (
            consecutive_count
            >= self.REQUIRED_CONSECUTIVE_CYCLES
        )

        return {
            "district": district,
            "disease": disease,
            "outbreak_probability":
                outbreak_probability,
            "confidence": confidence,
            "qualifies": qualifies,
            "consecutive_cycles":
                consecutive_count,
            "required_cycles":
                self.REQUIRED_CONSECUTIVE_CYCLES,
            "emergency_escalated":
                escalated,
            "status": (
                "EMERGENCY_RESPONSE"
                if escalated
                else "NORMAL"
            ),
        }


    def _qualifies(
        self,
        outbreak_probability: float,
        confidence: float,
    ) -> bool:
        """
        Check whether the current prediction
        meets emergency thresholds.
        """

        return (
            outbreak_probability
            >= self.PROBABILITY_THRESHOLD
            and confidence
            >= self.CONFIDENCE_THRESHOLD
        )


    def _update_consecutive_count(
        self,
        key: str,
        qualifies: bool,
    ) -> int:
        """
        Update consecutive qualifying
        prediction cycle count.
        """

        if qualifies:

            self.prediction_history[key] = (
                self.prediction_history.get(
                    key,
                    0,
                )
                + 1
            )

        else:

            # Reset consecutive count if
            # current cycle does not qualify.
            self.prediction_history[key] = 0

        return self.prediction_history[key]


    def _build_key(
        self,
        district: str,
        disease: str,
    ) -> str:
        """
        Build unique district + disease key.
        """

        return (
            f"{district.strip().lower()}"
            f":{disease.strip().lower()}"
        )


    def reset(
        self,
        district: str,
        disease: str,
    ) -> None:
        """
        Reset prediction history for a
        district and disease.
        """

        key = self._build_key(
            district=district,
            disease=disease,
        )

        self.prediction_history[key] = 0