from app.monitoring.drift_monitor import (
    PSI_THRESHOLD,
    monitor_feature_drift,
)

from app.monitoring.volume_monitor import (
    RECORD_THRESHOLD,
    check_data_volume,
)


def check_retraining_trigger(
    reference_df,
    current_df,
    new_record_count: int
) -> dict:
    """
    Determine whether model retraining is required.

    Retraining is triggered when:
    1. New validated records >= 500
    OR
    2. Maximum feature PSI >= 0.20
    """

    volume_result = check_data_volume(
        new_record_count
    )

    drift_result = monitor_feature_drift(
        reference_df,
        current_df
    )

    volume_triggered = (
        volume_result["volume_triggered"]
    )

    drift_triggered = (
        drift_result["drift_detected"]
    )

    retraining_required = (
        volume_triggered
        or
        drift_triggered
    )

    triggers = []

    if volume_triggered:
        triggers.append(
            "DATA_VOLUME"
        )

    if drift_triggered:
        triggers.append(
            "DATA_DRIFT"
        )

    return {
        "retraining_required": retraining_required,

        "triggers": triggers,

        "new_records": new_record_count,
        "record_threshold": RECORD_THRESHOLD,

        "max_psi": drift_result["max_psi"],
        "psi_threshold": PSI_THRESHOLD,

        "volume_triggered": volume_triggered,
        "drift_triggered": drift_triggered,

        "feature_psi": drift_result["feature_psi"]
    }