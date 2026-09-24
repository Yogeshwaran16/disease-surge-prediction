from typing import Dict


class ModelBacktester:

    def __init__(self, primary_metric: str = "f1_score"):
        self.primary_metric = primary_metric

    def compare(
        self,
        champion_metrics: Dict[str, float],
        candidate_metrics: Dict[str, float]
    ) -> dict:
        """
        Compare candidate model against champion model.
        """

        if self.primary_metric not in champion_metrics:
            raise ValueError(
                f"Champion metric '{self.primary_metric}' not found"
            )

        if self.primary_metric not in candidate_metrics:
            raise ValueError(
                f"Candidate metric '{self.primary_metric}' not found"
            )

        champion_value = float(
            champion_metrics[self.primary_metric]
        )

        candidate_value = float(
            candidate_metrics[self.primary_metric]
        )

        metric_delta = (
            candidate_value - champion_value
        )

        return {
            "primary_metric": self.primary_metric,
            "champion_value": champion_value,
            "candidate_value": candidate_value,
            "metric_delta": metric_delta,
            "candidate_improved": metric_delta > 0
        }

    def generate_report(
        self,
        champion_metrics: Dict[str, float],
        candidate_metrics: Dict[str, float]
    ) -> dict:
        """
        Generate complete champion vs candidate report.
        """

        comparison = self.compare(
            champion_metrics,
            candidate_metrics
        )

        return {
            "champion": champion_metrics,
            "candidate": candidate_metrics,
            "comparison": comparison
        }