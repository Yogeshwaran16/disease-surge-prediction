import pandas as pd


from app.features.lag_features import (
    add_lag_features,
)

from app.features.rolling_features import (
    add_rolling_features,
)

from app.features.trend_features import (
    add_trend_features,
)

from app.features.mosquito_breeding_index import (
    add_mosquito_breeding_index,
)

from app.features.seasonal_features import (
    add_seasonal_features,
)

from app.features.feature_versioning import (
    FeatureVersionManager,
)

from app.features.feature_validator import (
    validate_feature_store,
)

from app.features.feature_freshness import (
    FeatureFreshnessValidator,
)

from app.features.feature_completeness import (
    FeatureCompletenessValidator,
)


# ============================================
# FEATURE ENGINEERING AGENT
# ============================================

class FeatureEngineeringAgent:


    # ========================================
    # INITIALIZE
    # ========================================

    def __init__(

        self,

        feature_version="v1.0",

        max_feature_age_days=7,

        max_feature_age_hours=24,

    ):

        self.feature_version = (
            feature_version
        )


        self.max_feature_age_days = (
            max_feature_age_days
        )


        self.max_feature_age_hours = (
            max_feature_age_hours
        )


        self.version_manager = (
            FeatureVersionManager()
        )


        # ====================================
        # FRESHNESS VALIDATOR
        # ====================================

        self.freshness_validator = (
            FeatureFreshnessValidator(

                max_age_hours=
                    self.max_feature_age_hours

            )
        )


        # ====================================
        # COMPLETENESS VALIDATOR
        # ====================================

        self.completeness_validator = (
            FeatureCompletenessValidator()
        )


        # ====================================
        # LAST VALIDATION RESULT
        # ====================================

        self.last_validation = None


    # ========================================
    # VALIDATE INPUT
    # ========================================

    def validate_input(

        self,

        dataframe: pd.DataFrame,

    ):


        if dataframe is None:

            raise ValueError(
                "Input dataframe cannot be None."
            )


        if dataframe.empty:

            raise ValueError(
                "Input dataframe cannot be empty."
            )


        required_columns = [

            "district",

            "disease",

            "date",

            "cases",

        ]


        missing_columns = [

            column

            for column in required_columns

            if column not in dataframe.columns

        ]


        if missing_columns:

            raise ValueError(

                "Missing required columns: "

                +

                ", ".join(
                    missing_columns
                )

            )


        return True


    # ========================================
    # PROCESS FEATURES
    # ========================================

    def process(

        self,

        dataframe: pd.DataFrame,

    ) -> pd.DataFrame:


        # ====================================
        # COPY DATA
        # ====================================

        df = dataframe.copy()


        # ====================================
        # VALIDATE INPUT
        # ====================================

        self.validate_input(
            df
        )


        # ====================================
        # DATE CONVERSION
        # ====================================

        df["date"] = pd.to_datetime(

            df["date"],

            errors="coerce",

        )


        if df["date"].isna().any():

            raise ValueError(
                "Invalid date values found."
            )


        # ====================================
        # SORT TIME SERIES
        # ====================================

        df = df.sort_values(

            by=[

                "district",

                "disease",

                "date",

            ]

        ).reset_index(

            drop=True

        )


        # ====================================
        # LAG FEATURES
        # ====================================

        df = add_lag_features(
            df
        )


        # ====================================
        # ROLLING FEATURES
        # ====================================

        df = add_rolling_features(
            df
        )


        # ====================================
        # TREND FEATURES
        # ====================================

        df = add_trend_features(
            df
        )


        # ====================================
        # MOSQUITO BREEDING INDEX
        # ====================================

        df = add_mosquito_breeding_index(
            df
        )


        # ====================================
        # SEASONAL FEATURES
        # ====================================

        df = add_seasonal_features(
            df
        )


        # ====================================
        # FEATURE VERSION
        # ====================================

        df = self.version_manager.add_version(

            dataframe=df,

            version=self.feature_version,

        )


        # ====================================
        # EXISTING FEATURE VALIDATION
        # ====================================

        base_validation = (
            validate_feature_store(

                dataframe=df,

                max_age_days=
                    self.max_feature_age_days,

            )
        )


        # ====================================
        # FRESHNESS VALIDATION
        # ====================================

        freshness_validation = (
            self.freshness_validator
            .validate_dataframe(

                df

            )
        )


        # ====================================
        # COMPLETENESS VALIDATION
        # ====================================

        completeness_validation = (
            self.completeness_validator
            .validate_dataframe(

                df

            )
        )


        # ====================================
        # COMBINE VALIDATION RESULTS
        # ====================================

        self.last_validation = {

            "valid":

                bool(

                    base_validation.get(
                        "valid",
                        True
                    )

                    and

                    freshness_validation.get(
                        "is_fresh",
                        False
                    )

                    and

                    completeness_validation.get(
                        "is_complete",
                        False
                    )

                ),


            "base_validation":
                base_validation,


            "freshness":
                freshness_validation,


            "completeness":
                completeness_validation,

        }


        # ====================================
        # RETURN FEATURES
        # ====================================

        return df


    # ========================================
    # GET LAST VALIDATION
    # ========================================

    def get_last_validation(

        self,

    ) -> dict:


        if self.last_validation is None:

            return {

                "valid": False,

                "message":
                    "No validation has been run yet.",

            }


        return self.last_validation


# ============================================
# QUICK FUNCTION
# ============================================

def engineer_features(

    dataframe: pd.DataFrame,

    feature_version="v1.0",

) -> pd.DataFrame:


    agent = FeatureEngineeringAgent(

        feature_version=feature_version

    )


    return agent.process(
        dataframe
    )