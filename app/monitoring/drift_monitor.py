import numpy as np
import pandas as pd


PSI_THRESHOLD = 0.20


def calculate_psi(
    expected: pd.Series,
    actual: pd.Series,
    bins: int = 10
) -> float:

    expected = pd.to_numeric(
        expected,
        errors="coerce"
    ).dropna().to_numpy()

    actual = pd.to_numeric(
        actual,
        errors="coerce"
    ).dropna().to_numpy()

    if len(expected) == 0 or len(actual) == 0:
        return 0.0

    breakpoints = np.percentile(
        expected,
        np.linspace(0, 100, bins + 1)
    )

    breakpoints = np.unique(breakpoints)

    if len(breakpoints) < 2:
        return 0.0

    expected_counts = np.histogram(
        expected,
        bins=breakpoints
    )[0]

    actual_counts = np.histogram(
        actual,
        bins=breakpoints
    )[0]

    expected_pct = (
        expected_counts / len(expected)
    )

    actual_pct = (
        actual_counts / len(actual)
    )

    epsilon = 0.0001

    expected_pct = np.where(
        expected_pct == 0,
        epsilon,
        expected_pct
    )

    actual_pct = np.where(
        actual_pct == 0,
        epsilon,
        actual_pct
    )

    psi = np.sum(
        (actual_pct - expected_pct)
        * np.log(
            actual_pct / expected_pct
        )
    )

    return float(psi)


def monitor_feature_drift(
    reference_df: pd.DataFrame,
    current_df: pd.DataFrame
) -> dict:

    results = {}

    common_columns = [
        column
        for column in reference_df.columns
        if column in current_df.columns
    ]

    for feature in common_columns:

        if not pd.api.types.is_numeric_dtype(
            reference_df[feature]
        ):
            continue

        psi = calculate_psi(
            reference_df[feature],
            current_df[feature]
        )

        results[feature] = round(
            psi,
            6
        )

    max_psi = (
        max(results.values())
        if results
        else 0.0
    )

    return {
        "feature_psi": results,
        "max_psi": round(max_psi, 6),
        "threshold": PSI_THRESHOLD,
        "drift_detected": (
            max_psi >= PSI_THRESHOLD
        )
    }