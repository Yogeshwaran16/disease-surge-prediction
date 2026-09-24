import pandas as pd


# ============================================
# DEFAULT REQUIRED COLUMNS
# ============================================

DEFAULT_REQUIRED_COLUMNS = [

    "district",

    "disease",

    "date",

    "cases",

    "rainfall",

    "humidity",

    "temperature",

    "mosquito_breeding_index",

]


# ============================================
# CHECK REQUIRED COLUMNS
# ============================================

def validate_required_columns(

    dataframe: pd.DataFrame,

    required_columns=None,

) -> dict:

    df = dataframe.copy()


    if required_columns is None:

        required_columns = (
            DEFAULT_REQUIRED_COLUMNS
        )


    missing_columns = [

        column

        for column in required_columns

        if column not in df.columns

    ]


    return {

        "valid": len(missing_columns) == 0,

        "missing_columns": missing_columns,

        "required_columns": required_columns,

    }


# ============================================
# CHECK MISSING VALUES
# ============================================

def validate_missing_values(

    dataframe: pd.DataFrame,

) -> dict:

    df = dataframe.copy()


    missing_counts = (

        df
        .isna()
        .sum()
        .to_dict()

    )


    total_missing = int(

        sum(
            missing_counts.values()
        )

    )


    rows = len(df)

    columns = len(df.columns)

    total_cells = rows * columns


    if total_cells > 0:

        completeness = (

            (
                total_cells - total_missing
            )

            /

            total_cells

        ) * 100

    else:

        completeness = 0.0


    missing_columns = {

        column: int(count)

        for column, count

        in missing_counts.items()

        if count > 0

    }


    return {

        "valid": total_missing == 0,

        "total_missing": total_missing,

        "missing_by_column": missing_columns,

        "completeness_percentage":

            round(
                completeness,
                2
            ),

    }


# ============================================
# CHECK DUPLICATES
# ============================================

def validate_duplicates(

    dataframe: pd.DataFrame,

    key_columns=None,

) -> dict:

    df = dataframe.copy()


    if key_columns is None:

        key_columns = [

            "district",

            "disease",

            "date",

        ]


    available_keys = [

        column

        for column in key_columns

        if column in df.columns

    ]


    if not available_keys:

        return {

            "valid": False,

            "duplicate_count": 0,

            "message":

                "No key columns available.",

        }


    duplicate_count = int(

        df.duplicated(

            subset=available_keys,

            keep=False,

        ).sum()

    )


    return {

        "valid":

            duplicate_count == 0,

        "duplicate_count":

            duplicate_count,

        "key_columns":

            available_keys,

    }


# ============================================
# CHECK FEATURE FRESHNESS
# ============================================

def validate_feature_freshness(

    dataframe: pd.DataFrame,

    date_column="date",

    max_age_days=7,

) -> dict:

    df = dataframe.copy()


    if date_column not in df.columns:

        return {

            "valid": False,

            "fresh": False,

            "message":

                f"Missing date column: {date_column}",

        }


    dates = pd.to_datetime(

        df[date_column],

        errors="coerce",

    ).dropna()


    if dates.empty:

        return {

            "valid": False,

            "fresh": False,

            "message":

                "No valid feature dates found.",

        }


    latest_date = dates.max()


    current_date = (

        pd.Timestamp.now()

        .normalize()

    )


    age_days = int(

        (
            current_date
            -

            latest_date.normalize()
        ).days

    )


    fresh = (

        age_days <= max_age_days

    )


    return {

        "valid": True,

        "fresh": fresh,

        "latest_feature_date":

            str(
                latest_date.date()
            ),

        "age_days": age_days,

        "max_age_days": max_age_days,

    }


# ============================================
# VALIDATE NUMERIC FEATURES
# ============================================

def validate_numeric_features(

    dataframe: pd.DataFrame,

    feature_columns=None,

) -> dict:

    df = dataframe.copy()


    if feature_columns is None:

        feature_columns = [

            "cases",

            "rainfall",

            "humidity",

            "temperature",

            "mosquito_breeding_index",

        ]


    invalid_features = {}


    for column in feature_columns:


        if column not in df.columns:

            continue


        numeric_values = pd.to_numeric(

            df[column],

            errors="coerce",

        )


        invalid_count = int(

            numeric_values
            .isna()
            .sum()

        )


        if invalid_count > 0:

            invalid_features[
                column
            ] = invalid_count


    return {

        "valid":

            len(
                invalid_features
            ) == 0,

        "invalid_features":

            invalid_features,

    }


# ============================================
# FULL FEATURE VALIDATION
# ============================================

def validate_feature_store(

    dataframe: pd.DataFrame,

    required_columns=None,

    max_age_days=7,

) -> dict:


    # ========================================
    # EMPTY DATA CHECK
    # ========================================

    if dataframe is None:

        return {

            "valid": False,

            "message":

                "Feature dataframe is None.",

        }


    if dataframe.empty:

        return {

            "valid": False,

            "message":

                "Feature dataframe is empty.",

        }


    # ========================================
    # RUN VALIDATIONS
    # ========================================

    column_validation = (

        validate_required_columns(

            dataframe,

            required_columns,

        )

    )


    missing_validation = (

        validate_missing_values(
            dataframe
        )

    )


    duplicate_validation = (

        validate_duplicates(
            dataframe
        )

    )


    freshness_validation = (

        validate_feature_freshness(

            dataframe,

            max_age_days=max_age_days,

        )

    )


    numeric_validation = (

        validate_numeric_features(
            dataframe
        )

    )


    # ========================================
    # FINAL STATUS
    # ========================================

    overall_valid = (

        column_validation["valid"]

        and

        duplicate_validation["valid"]

        and

        numeric_validation["valid"]

    )


    return {

        "valid": overall_valid,

        "rows": len(dataframe),

        "columns": len(dataframe.columns),

        "column_validation":

            column_validation,

        "missing_value_validation":

            missing_validation,

        "duplicate_validation":

            duplicate_validation,

        "freshness_validation":

            freshness_validation,

        "numeric_validation":

            numeric_validation,

    }