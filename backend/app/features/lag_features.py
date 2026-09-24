import pandas as pd


# ============================================
# LAG CONFIGURATION
# ============================================

LAG_DAYS = [

    7,

    14,

    21,

]


# ============================================
# DEFAULT FEATURE COLUMNS
# ============================================

DEFAULT_COLUMNS = [

    "cases",

    "rainfall",

    "humidity",

    "temperature",

]


# ============================================
# ADD LAG FEATURES
# ============================================

def add_lag_features(

    dataframe: pd.DataFrame,

    group_columns=None,

    feature_columns=None,

    date_column="date",

) -> pd.DataFrame:


    # ========================================
    # COPY DATA
    # ========================================

    df = dataframe.copy()


    # ========================================
    # DEFAULT GROUP COLUMNS
    # ========================================

    if group_columns is None:

        group_columns = [

            "district",

            "disease",

        ]


    # ========================================
    # DEFAULT FEATURE COLUMNS
    # ========================================

    if feature_columns is None:

        feature_columns = (
            DEFAULT_COLUMNS
        )


    # ========================================
    # VALIDATE REQUIRED COLUMNS
    # ========================================

    required_columns = (

        list(group_columns)

        +

        [date_column]

    )


    missing_columns = [

        column

        for column in required_columns

        if column not in df.columns

    ]


    if missing_columns:

        raise ValueError(

            "Missing required columns: "

            +

            ", ".join(
                missing_columns
            )

        )


    # ========================================
    # CONVERT DATE
    # ========================================

    df[date_column] = pd.to_datetime(

        df[date_column],

        errors="coerce",

    )


    # ========================================
    # SORT TIME SERIES
    # ========================================

    df = df.sort_values(

        by=(

            list(group_columns)

            +

            [date_column]

        )

    ).reset_index(

        drop=True

    )


    # ========================================
    # CREATE LAG FEATURES
    # ========================================

    for column in feature_columns:


        if column not in df.columns:

            continue


        for lag_day in LAG_DAYS:


            feature_name = (

                f"{column}_lag_"

                f"{lag_day}"

            )


            df[feature_name] = (

                df

                .groupby(
                    group_columns
                )[column]

                .shift(
                    lag_day
                )

            )


    # ========================================
    # RETURN DATA
    # ========================================

    return df


# ============================================
# GET LAG FEATURE NAMES
# ============================================

def get_lag_feature_names(

    feature_columns=None,

):


    if feature_columns is None:

        feature_columns = (
            DEFAULT_COLUMNS
        )


    feature_names = []


    for column in feature_columns:

        for lag_day in LAG_DAYS:

            feature_names.append(

                f"{column}_lag_"

                f"{lag_day}"

            )


    return feature_names