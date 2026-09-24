import numpy as np
import pandas as pd


# ============================================
# ADD SEASONAL FEATURES
# ============================================

def add_seasonal_features(

    dataframe: pd.DataFrame,

    date_column="date",

) -> pd.DataFrame:


    # ========================================
    # COPY DATA
    # ========================================

    df = dataframe.copy()


    # ========================================
    # VALIDATE DATE COLUMN
    # ========================================

    if date_column not in df.columns:

        raise ValueError(

            f"Missing required column: {date_column}"

        )


    # ========================================
    # CONVERT DATE
    # ========================================

    df[date_column] = pd.to_datetime(

        df[date_column],

        errors="coerce",

    )


    # ========================================
    # CHECK INVALID DATES
    # ========================================

    if df[date_column].isna().all():

        raise ValueError(

            "No valid dates found."

        )


    # ========================================
    # BASIC DATE FEATURES
    # ========================================

    df["year"] = (

        df[date_column].dt.year

    )


    df["month"] = (

        df[date_column].dt.month

    )


    df["day_of_year"] = (

        df[date_column].dt.dayofyear

    )


    df["week_of_year"] = (

        df[date_column]
        .dt
        .isocalendar()
        .week
        .astype(int)

    )


    # ========================================
    # MONTH CYCLICAL FEATURES
    # ========================================

    df["month_sin"] = (

        np.sin(

            2
            * np.pi
            * df["month"]

            / 12

        )

    )


    df["month_cos"] = (

        np.cos(

            2
            * np.pi
            * df["month"]

            / 12

        )

    )


    # ========================================
    # WEEK CYCLICAL FEATURES
    # ========================================

    df["week_sin"] = (

        np.sin(

            2
            * np.pi
            * df["week_of_year"]

            / 52

        )

    )


    df["week_cos"] = (

        np.cos(

            2
            * np.pi
            * df["week_of_year"]

            / 52

        )

    )


    # ========================================
    # DAY OF YEAR CYCLICAL FEATURES
    # ========================================

    df["day_of_year_sin"] = (

        np.sin(

            2
            * np.pi
            * df["day_of_year"]

            / 365

        )

    )


    df["day_of_year_cos"] = (

        np.cos(

            2
            * np.pi
            * df["day_of_year"]

            / 365

        )

    )


    # ========================================
    # SEASON LABEL
    # INDIA / TAMIL NADU FRIENDLY
    # ========================================

    def get_season(month):


        if pd.isna(month):

            return "UNKNOWN"


        month = int(month)


        # JAN - FEB

        if month in [1, 2]:

            return "WINTER"


        # MAR - MAY

        if month in [3, 4, 5]:

            return "SUMMER"


        # JUN - SEP

        if month in [6, 7, 8, 9]:

            return "SOUTHWEST_MONSOON"


        # OCT - DEC

        return "NORTHEAST_MONSOON"


    df["season"] = (

        df["month"]
        .apply(
            get_season
        )

    )


    # ========================================
    # MONSOON INDICATOR
    # ========================================

    df["is_monsoon"] = (

        df["season"]
        .isin(

            [

                "SOUTHWEST_MONSOON",

                "NORTHEAST_MONSOON",

            ]

        )
        .astype(int)

    )


    # ========================================
    # RETURN DATA
    # ========================================

    return df


# ============================================
# GET SEASONAL FEATURE NAMES
# ============================================

def get_seasonal_feature_names():


    return [

        "year",

        "month",

        "day_of_year",

        "week_of_year",

        "month_sin",

        "month_cos",

        "week_sin",

        "week_cos",

        "day_of_year_sin",

        "day_of_year_cos",

        "season",

        "is_monsoon",

    ]