import pandas as pd


# ============================================
# MOSQUITO BREEDING INDEX CONFIGURATION
# ============================================

MAX_RAINFALL = 100.0

MIN_HUMIDITY = 40.0
MAX_HUMIDITY = 100.0

OPTIMAL_TEMPERATURE_MIN = 25.0
OPTIMAL_TEMPERATURE_MAX = 32.0

MAX_STANDING_WATER_INDEX = 100.0


# ============================================
# CLAMP SCORE
# ============================================

def clamp_score(
    value: float,
) -> float:

    return max(
        0.0,
        min(
            100.0,
            float(value),
        ),
    )


# ============================================
# RAINFALL SCORE
# ============================================

def calculate_rainfall_score(
    rainfall,
) -> float:

    rainfall = (
        float(rainfall)
        if pd.notna(rainfall)
        else 0.0
    )

    score = (
        rainfall / MAX_RAINFALL
    ) * 100.0

    return clamp_score(
        score
    )


# ============================================
# HUMIDITY SCORE
# ============================================

def calculate_humidity_score(
    humidity,
) -> float:

    humidity = (
        float(humidity)
        if pd.notna(humidity)
        else 0.0
    )

    if humidity <= MIN_HUMIDITY:

        return 0.0


    score = (

        (
            humidity -
            MIN_HUMIDITY
        )

        /

        (
            MAX_HUMIDITY -
            MIN_HUMIDITY
        )

    ) * 100.0


    return clamp_score(
        score
    )


# ============================================
# TEMPERATURE SUITABILITY SCORE
# ============================================

def calculate_temperature_score(
    temperature,
) -> float:

    temperature = (
        float(temperature)
        if pd.notna(temperature)
        else 0.0
    )


    if (

        OPTIMAL_TEMPERATURE_MIN
        <= temperature
        <= OPTIMAL_TEMPERATURE_MAX

    ):

        return 100.0


    if (
        temperature <
        OPTIMAL_TEMPERATURE_MIN
    ):

        difference = (

            OPTIMAL_TEMPERATURE_MIN
            - temperature

        )

    else:

        difference = (

            temperature
            - OPTIMAL_TEMPERATURE_MAX

        )


    score = (

        100.0

        -

        (
            difference * 10.0
        )

    )


    return clamp_score(
        score
    )


# ============================================
# STANDING WATER SCORE
# ============================================

def calculate_standing_water_score(
    standing_water_index,
) -> float:

    standing_water_index = (

        float(
            standing_water_index
        )

        if pd.notna(
            standing_water_index
        )

        else 0.0

    )


    score = (

        standing_water_index

        /

        MAX_STANDING_WATER_INDEX

    ) * 100.0


    return clamp_score(
        score
    )


# ============================================
# CALCULATE MOSQUITO BREEDING INDEX
# ============================================

def calculate_mosquito_breeding_index(

    rainfall,

    humidity,

    temperature,

    standing_water_index=50,

) -> float:


    rainfall_score = (
        calculate_rainfall_score(
            rainfall
        )
    )


    humidity_score = (
        calculate_humidity_score(
            humidity
        )
    )


    temperature_score = (
        calculate_temperature_score(
            temperature
        )
    )


    standing_water_score = (
        calculate_standing_water_score(
            standing_water_index
        )
    )


    # ========================================
    # WEIGHTED MBI SCORE
    # ========================================

    mbi_score = (

        rainfall_score * 0.30

        +

        humidity_score * 0.25

        +

        temperature_score * 0.25

        +

        standing_water_score * 0.20

    )


    return round(

        clamp_score(
            mbi_score
        ),

        2

    )


# ============================================
# MBI RISK LEVEL
# ============================================

def get_mbi_risk_level(
    mbi_score,
) -> str:


    score = (
        float(mbi_score)
        if pd.notna(mbi_score)
        else 0.0
    )


    if score >= 76:

        return "CRITICAL"


    if score >= 51:

        return "HIGH"


    if score >= 26:

        return "MEDIUM"


    return "LOW"


# ============================================
# ADD MBI FEATURES TO DATAFRAME
# ============================================

def add_mosquito_breeding_index(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:


    df = dataframe.copy()


    # ========================================
    # REQUIRED WEATHER COLUMNS
    # ========================================

    required_columns = [

        "rainfall",

        "humidity",

        "temperature",

    ]


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
    # DEFAULT STANDING WATER INDEX
    # ========================================

    if (
        "standing_water_index"
        not in df.columns
    ):

        df[
            "standing_water_index"
        ] = 50.0


    # ========================================
    # CALCULATE MBI
    # ========================================

    df[
        "mosquito_breeding_index"
    ] = df.apply(

        lambda row:

        calculate_mosquito_breeding_index(

            rainfall=
                row["rainfall"],

            humidity=
                row["humidity"],

            temperature=
                row["temperature"],

            standing_water_index=
                row[
                    "standing_water_index"
                ],

        ),

        axis=1,

    )


    # ========================================
    # MBI RISK LEVEL
    # ========================================

    df[
        "mbi_risk_level"
    ] = df[
        "mosquito_breeding_index"
    ].apply(

        get_mbi_risk_level

    )


    return df