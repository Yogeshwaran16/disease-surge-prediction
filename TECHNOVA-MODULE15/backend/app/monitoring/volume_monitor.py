RECORD_THRESHOLD = 500


def check_data_volume(new_record_count: int) -> dict:
    """
    Check whether enough new validated records
    have arrived to trigger model retraining.
    """

    if new_record_count < 0:
        raise ValueError(
            "new_record_count cannot be negative"
        )

    triggered = (
        new_record_count >= RECORD_THRESHOLD
    )

    return {
        "new_records": new_record_count,
        "threshold": RECORD_THRESHOLD,
        "volume_triggered": triggered
    }