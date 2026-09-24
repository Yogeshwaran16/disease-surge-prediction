import pandas as pd


# ============================================
# ROLLING WINDOW CONFIGURATION
# ============================================

ROLLING_WINDOWS = [

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
# ADD ROLLING FEATURES
# ============================================

def add_rolling_features(

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
    # CREATE ROLLING MEAN FEATURES
    # ========================================

    for column in feature_columns:


        if column not in df.columns:

            continue


        for window in ROLLING_WINDOWS:


            feature_name = (

                f"{column}_rolling_mean_"

                f"{window}"

            )


            df[feature_name] = (

                df

                .groupby(
                    group_columns
                )[column]

                .transform(

                    lambda series:

                    series.rolling(

                        window=window,

                        min_periods=1,

                    ).mean()

                )

            )


    # ========================================
    # CASES MOVING AVERAGE CROSSOVER
    # ========================================

    if "cases" in df.columns:


        df[
            "cases_ma_crossover"
        ] = (

            df[
                "cases_rolling_mean_7"
            ]

            -

            df[
                "cases_rolling_mean_21"
            ]

        )


        df[
            "cases_trend_signal"
        ] = "STABLE"


        df.loc[

            df[
                "cases_ma_crossover"
            ] > 0,

            "cases_trend_signal"

        ] = "INCREASING"


        df.loc[

            df[
                "cases_ma_crossover"
            ] < 0,

            "cases_trend_signal"

        ] = "DECREASING"


    # ========================================
    # RETURN DATA
    # ========================================

    return df


# ============================================
# GET ROLLING FEATURE NAMES
# ============================================

def get_rolling_feature_names(

    feature_columns=None,

):


    if feature_columns is None:

        feature_columns = (
            DEFAULT_COLUMNS
        )


    feature_names = []


    for column in feature_columns:

        for window in ROLLING_WINDOWS:

            feature_names.append(

                f"{column}_rolling_mean_"

                f"{window}"

            )


    # ========================================
    # CASE SIGNAL FEATURES
    # ========================================

    feature_names.extend([

        "cases_ma_crossover",

        "cases_trend_signal",

    ])


    return feature_names