from datetime import (
    datetime,
    timedelta,
)

import pandas as pd


# ============================================
# FEATURE FRESHNESS VALIDATOR
# ============================================

class FeatureFreshnessValidator:


    # ========================================
    # INITIALIZE
    # ========================================

    def __init__(

        self,

        max_age_hours: int = 24,

    ):

        self.max_age_hours = (
            max_age_hours
        )


    # ========================================
    # VALIDATE DATAFRAME FRESHNESS
    # ========================================

    def validate_dataframe(

        self,

        dataframe: pd.DataFrame,

        timestamp_column: str = (
            "feature_created_at"
        ),

    ) -> dict:


        # ====================================
        # EMPTY DATA CHECK
        # ====================================

        if dataframe.empty:

            return {

                "is_fresh": False,

                "message":
                    "Feature dataframe is empty.",

                "latest_timestamp":
                    None,

                "age_hours":
                    None,

            }


        # ====================================
        # TIMESTAMP COLUMN CHECK
        # ====================================

        if (

            timestamp_column

            not in dataframe.columns

        ):

            return {

                "is_fresh": False,

                "message":

                    f"Timestamp column "
                    f"'{timestamp_column}' "
                    f"not found.",

                "latest_timestamp":
                    None,

                "age_hours":
                    None,

            }


        # ====================================
        # GET LATEST TIMESTAMP
        # ====================================

        timestamps = pd.to_datetime(

            dataframe[
                timestamp_column
            ],

            errors="coerce",

        )


        latest_timestamp = (

            timestamps.max()

        )


        # ====================================
        # INVALID TIMESTAMP
        # ====================================

        if pd.isna(

            latest_timestamp

        ):

            return {

                "is_fresh": False,

                "message":
                    "No valid feature timestamp found.",

                "latest_timestamp":
                    None,

                "age_hours":
                    None,

            }


        # ====================================
        # CALCULATE AGE
        # ====================================

        current_time = (
            datetime.now()
        )


        age = (

            current_time -

            latest_timestamp
            .to_pydatetime()

        )


        age_hours = (

            age.total_seconds()

            / 3600

        )


        # ====================================
        # CHECK FRESHNESS
        # ====================================

        is_fresh = (

            age_hours

            <=

            self.max_age_hours

        )


        # ====================================
        # RETURN RESULT
        # ====================================

        return {

            "is_fresh":
                bool(is_fresh),

            "message":

                (
                    "Features are fresh."
                    if is_fresh
                    else
                    "Features are stale."
                ),

            "latest_timestamp":

                str(
                    latest_timestamp
                ),

            "age_hours":

                round(
                    age_hours,
                    2
                ),

            "max_age_hours":

                self.max_age_hours,

        }


# ============================================
# SINGLETON VALIDATOR
# ============================================

feature_freshness_validator = (

    FeatureFreshnessValidator()

)