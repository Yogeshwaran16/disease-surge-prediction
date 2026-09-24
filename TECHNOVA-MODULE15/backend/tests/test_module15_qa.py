import pandas as pd
import numpy as np

from app.monitoring.volume_monitor import check_data_volume
from app.monitoring.drift_monitor import calculate_psi
from app.monitoring.trigger_monitor import check_retraining_trigger
from app.training.promotion import should_promote
from app.training.dataset_hash import generate_dataset_hash


def test_volume_trigger_below_threshold():
    result = check_data_volume(499)

    assert result["volume_triggered"] is False
    assert result["new_records"] == 499
    assert result["threshold"] == 500


def test_volume_trigger_at_threshold():
    result = check_data_volume(500)

    assert result["volume_triggered"] is True


def test_volume_negative_records_rejected():
    try:
        check_data_volume(-1)
        assert False
    except ValueError:
        assert True


def test_psi_no_drift():
    np.random.seed(42)

    reference = pd.Series(np.random.normal(50, 5, 500))
    current = pd.Series(np.random.normal(50, 5, 500))

    psi = calculate_psi(reference, current)

    assert psi >= 0
    assert psi < 0.20


def test_retraining_trigger_by_volume():
    np.random.seed(42)

    reference = pd.DataFrame({
        "temperature": np.random.normal(30, 2, 100),
        "rainfall": np.random.normal(80, 20, 100),
    })

    current = reference.copy()

    result = check_retraining_trigger(
        reference_df=reference,
        current_df=current,
        new_record_count=500
    )

    assert result["retraining_required"] is True
    assert "DATA_VOLUME" in result["triggers"]


def test_retraining_not_triggered():
    np.random.seed(42)

    reference = pd.DataFrame({
        "temperature": np.random.normal(30, 2, 500),
        "rainfall": np.random.normal(80, 20, 500),
    })

    current = reference.copy()

    result = check_retraining_trigger(
        reference_df=reference,
        current_df=current,
        new_record_count=100
    )

    assert result["retraining_required"] is False


def test_promotion_when_delta_is_met():
    result = should_promote(
        champion_metric=0.67,
        candidate_metric=0.71,
        minimum_delta=0.02
    )

    assert result["promote"] is True
    assert result["metric_delta"] == 0.04


def test_promotion_rejected_when_delta_is_insufficient():
    result = should_promote(
        champion_metric=0.67,
        candidate_metric=0.68,
        minimum_delta=0.02
    )

    assert result["promote"] is False


def test_dataset_hash_is_deterministic():
    df = pd.DataFrame({
        "temperature": [30, 31, 32],
        "rainfall": [10, 20, 30],
        "disease": [0, 1, 1]
    })

    hash_1 = generate_dataset_hash(df)
    hash_2 = generate_dataset_hash(df.copy())

    assert hash_1 == hash_2
    assert len(hash_1) == 64