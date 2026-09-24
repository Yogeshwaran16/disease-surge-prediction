import pandas as pd


# ============================================
# FEATURE COMPLETENESS VALIDATOR
# ============================================

class FeatureCompletenessValidator:


    # ========================================
    # INITIALIZE
    # ========================================

    def __init__(

        self,

        required_columns=None,

    ):

        if required_columns is None:

            required_columns = [

                "district",

                "disease",

                "date",

                "cases",

                "rainfall",

                "humidity",

                "temperature",

                "standing_water_index",

                "feature_version",

                "feature_created_at",

            ]


        self.required_columns = (
            required_columns
        )


    # ========================================
    # VALIDATE DATAFRAME
    # ========================================

    def validate_dataframe(

        self,

        dataframe: pd.DataFrame,

    ) -> dict:


        # ====================================
        # EMPTY DATAFRAME
        # ====================================

        if dataframe.empty:

            return {

                "is_complete": False,

                "message":
                    "Feature dataframe is empty.",

                "total_rows": 0,

                "required_columns":
                    self.required_columns,

                "missing_columns":
                    self.required_columns,

                "columns_with_nulls":
                    [],

            }


        # ====================================
        # MISSING COLUMNS
        # ====================================

        missing_columns = [

            column

            for column in
            self.required_columns

            if column
            not in dataframe.columns

        ]


        # ====================================
        # NULL VALUES
        # ====================================

        existing_required_columns = [

            column

            for column in
            self.required_columns

            if column
            in dataframe.columns

        ]


        columns_with_nulls = [

            column

            for column in
            existing_required_columns

            if dataframe[column]
            .isnull()
            .any()

        ]


        # ====================================
        # COMPLETENESS RESULT
        # ====================================

        is_complete = (

            len(missing_columns) == 0

            and

            len(columns_with_nulls) == 0

        )


        # ====================================
        # RETURN RESULT
        # ====================================

        return {

            "is_complete":
                bool(is_complete),

            "message":

                (
                    "Features are complete."
                    if is_complete
                    else
                    "Features are incomplete."
                ),

            "total_rows":

                len(
                    dataframe
                ),

            "required_columns":

                self.required_columns,

            "missing_columns":

                missing_columns,

            "columns_with_nulls":

                columns_with_nulls,

        }


# ============================================
# SINGLETON VALIDATOR
# ============================================

feature_completeness_validator = (

    FeatureCompletenessValidator()

)