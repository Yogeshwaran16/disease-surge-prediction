import hashlib
import pandas as pd


def generate_dataset_hash(df: pd.DataFrame) -> str:
    """
    Generate a SHA-256 hash for the training dataset.
    """

    normalized_df = df.copy()

    # Keep columns in a fixed order
    normalized_df = normalized_df.reindex(
        sorted(normalized_df.columns),
        axis=1
    )

    # Keep rows in a fixed order
    normalized_df = normalized_df.sort_values(
        by=list(normalized_df.columns)
    ).reset_index(drop=True)

    # Convert dataset to bytes
    data = normalized_df.to_csv(
        index=False
    ).encode("utf-8")

    # Generate SHA-256 hash
    return hashlib.sha256(data).hexdigest()