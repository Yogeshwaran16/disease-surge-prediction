import os


DEFAULT_MINIMUM_DELTA = 0.02


def get_minimum_delta() -> float:
    value = os.getenv(
        "MIN_PROMOTION_DELTA",
        str(DEFAULT_MINIMUM_DELTA)
    )

    try:
        return float(value)
    except ValueError:
        return DEFAULT_MINIMUM_DELTA


def should_promote(
    champion_metric: float,
    candidate_metric: float,
    minimum_delta: float | None = None
) -> dict:

    if minimum_delta is None:
        minimum_delta = get_minimum_delta()

    delta = round(candidate_metric - champion_metric, 10)

    promoted = delta >= minimum_delta

    if promoted:
        reason = (
            f"Candidate improved by {delta:.4f}; "
            f"minimum required delta is "
            f"{minimum_delta:.4f}"
        )
    else:
        reason = (
            f"Candidate improvement is {delta:.4f}; "
            f"minimum required delta is "
            f"{minimum_delta:.4f}"
        )

    return {
        "promote": promoted,
        "champion_metric": champion_metric,
        "candidate_metric": candidate_metric,
        "metric_delta": delta,
        "minimum_delta": minimum_delta,
        "reason": reason
    }
