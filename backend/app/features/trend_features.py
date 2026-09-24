import numpy as np
import pandas as pd


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
# DEFAULT TREND WINDOW
# ============================================

TREND_WINDOW = 7


# ============================================
# CALCULATE SLOPE
# ============================================

def calculate_slope(

    values,

) -> float:


    clean_values = (

        pd.Series(values)

        .dropna()

        .astype(float)

        .values

    )


    if len(clean_values) < 2:

        return 0.0


    x = np.arange(
        len(clean_values)
    )


    slope = np.polyfit(

        x,

        clean_values,

        1,

    )[0]


    return float(
        slope
    )


# ============================================
# ADD TREND FEATURES
# ============================================

def add_trend_features(

    dataframe: pd.DataFrame,

    group_columns=None,

    feature_columns=None,

    date_column="date",

    window=TREND_WINDOW,

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
    # VALIDATE COLUMNS
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
    # VALIDATE WINDOW
    # ========================================

    window = max(
        2,
        int(window)
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
    # CREATE TREND SLOPE FEATURES
    # ========================================

    for column in feature_columns:


        if column not in df.columns:

            continue


        feature_name = (

            f"{column}_trend_slope"

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

                    min_periods=2,

                ).apply(

                    calculate_slope,

                    raw=False,

                )

            )

            .fillna(0.0)

        )


        # ====================================
        # TREND SIGNAL
        # ====================================

        signal_name = (

            f"{column}_trend_signal"

        )


        df[signal_name] = (

            "STABLE"

        )


        df.loc[

            df[feature_name] > 0,

            signal_name

        ] = "INCREASING"


        df.loc[

            df[feature_name] < 0,

            signal_name

        ] = "DECREASING"


    # ========================================
    # RETURN DATA
    # ========================================

    return df


# ============================================
# GET TREND FEATURE NAMES
# ============================================

def get_trend_feature_names(

    feature_columns=None,

):


    if feature_columns is None:

        feature_columns = (
            DEFAULT_COLUMNS
        )


    feature_names = []


    for column in feature_columns:


        feature_names.append(

            f"{column}_trend_slope"

        )


        feature_names.append(

            f"{column}_trend_signal"

        )


    return feature_names