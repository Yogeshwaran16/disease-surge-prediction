import csv
from pathlib import Path

from fastapi import APIRouter, Depends
from app.api.utils.query_params import CommonQueryParams, get_common_query_params, paginate_items


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/districts",
    tags=["District Analysis"],
)


# ============================================================
# DATA FILES
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]

PREDICTIONS_FILE = (
    BASE_DIR
    / "ml"
    / "district_predictions.csv"
)

RANKING_FILE = (
    BASE_DIR
    / "ml"
    / "district_ranking.csv"
)


# ============================================================
# LOAD PREDICTIONS
# ============================================================

def load_predictions():

    if not PREDICTIONS_FILE.exists():

        raise FileNotFoundError(
            f"Prediction file not found: "
            f"{PREDICTIONS_FILE}"
        )

    with open(
        PREDICTIONS_FILE,
        "r",
        encoding="utf-8-sig",
    ) as file:

        return list(
            csv.DictReader(file)
        )


# ============================================================
# LOAD EXISTING DISTRICT RANKING
# ============================================================

def load_ranking():

    if not RANKING_FILE.exists():

        raise FileNotFoundError(
            f"Ranking file not found: "
            f"{RANKING_FILE}"
        )

    ranking = []

    with open(
        RANKING_FILE,
        "r",
        encoding="utf-8-sig",
    ) as file:

        for row in csv.DictReader(file):

            ranking.append(
                {
                    "rank": int(
                        row["rank"]
                    ),

                    "district":
                        row["district"],

                    "risk_score":
                        float(
                            row["risk_score"]
                        ),

                    "risk_level":
                        row["risk_level"].upper(),
                }
            )

    return ranking


# ============================================================
# GET LATEST PREDICTION PERIOD
# ============================================================

def get_latest_period(
    predictions,
):

    periods = [

        (
            int(row["year"]),
            int(row["week_number"]),
        )

        for row in predictions

        if row.get("year")
        and row.get("week_number")
    ]


    if not periods:

        raise ValueError(
            "No valid prediction periods found."
        )


    return max(periods)


# ============================================================
# GET LATEST AVAILABLE PREDICTIONS
# ============================================================

def get_latest_predictions():

    predictions = load_predictions()


    latest_year, latest_week = (
        get_latest_period(
            predictions
        )
    )


    # --------------------------------------------------------
    # Keep the latest available prediction for each
    # district + disease combination.
    #
    # This prevents districts from disappearing when one
    # disease does not have a row in the global latest week.
    # --------------------------------------------------------

    latest_by_district_disease = {}


    for row in predictions:

        district = (
            row["district"]
            .strip()
        )

        disease = (
            row["disease"]
            .strip()
        )


        key = (
            district.lower(),
            disease.lower(),
        )


        period = (
            int(row["year"]),
            int(row["week_number"]),
        )


        current = (
            latest_by_district_disease
            .get(key)
        )


        if (

            current is None

            or period
            > (
                int(current["year"]),
                int(current["week_number"]),
            )

        ):

            latest_by_district_disease[
                key
            ] = row


    return (
        list(
            latest_by_district_disease.values()
        ),
        latest_year,
        latest_week,
    )


# ============================================================
# DISTRICT RANKING
# ============================================================

@router.get("/ranking")
def get_district_ranking():

    latest, latest_year, latest_week = (
        get_latest_predictions()
    )


    ranking = load_ranking()


    latest_by_district = {}


    for row in latest:

        district = (
            row["district"]
            .strip()
        )


        probability = float(
            row["surge_probability"]
        )


        expected_cases = int(
            float(
                row.get(
                    "expected_cases_2w",
                    0,
                )
            )
        )


        # ----------------------------------------------------
        # Keep the highest disease probability for the
        # district-level summary.
        # ----------------------------------------------------

        current = (
            latest_by_district.get(
                district.lower()
            )
        )


        if (

            current is None

            or probability
            > current["surge_probability"]

        ):

            latest_by_district[
                district.lower()
            ] = {

                "district":
                    district,

                "surge_probability":
                    probability,

                "expected_cases_2w":
                    expected_cases,

                "risk_level":
                    row.get(
                        "risk_level",
                        "LOW",
                    ).upper(),

            }


    # --------------------------------------------------------
    # Build final 38-district ranking
    # --------------------------------------------------------

    result = []


    for rank_row in ranking:

        district = (
            rank_row["district"]
        )


        current = (
            latest_by_district.get(
                district.lower()
            )
        )


        result.append(
            {

                "rank":
                    rank_row["rank"],

                "district":
                    district,

                "risk_score":
                    rank_row["risk_score"],

                "risk_level":
                    (
                        current["risk_level"]
                        if current
                        else rank_row[
                            "risk_level"
                        ]
                    ),

                "surge_probability":
                    (
                        current[
                            "surge_probability"
                        ]
                        if current
                        else 0
                    ),

                "expected_cases_2w":
                    (
                        current[
                            "expected_cases_2w"
                        ]
                        if current
                        else 0
                    ),

                "year":
                    latest_year,

                "week_number":
                    latest_week,

            }
        )


    return {

        "success": True,

        "total_districts":
            len(result),

        "year":
            latest_year,

        "week_number":
            latest_week,

        "data":
            result,

    }


# ============================================================
# SELECTED DISTRICT ANALYSIS
# ============================================================

@router.get("/{district_name}")
def get_district_analysis(
    district_name: str,
):

    latest, latest_year, latest_week = (
        get_latest_predictions()
    )


    # --------------------------------------------------------
    # Find selected district
    # --------------------------------------------------------

    district_data = [

        row

        for row in latest

        if row["district"]
        .strip()
        .lower()
        ==
        district_name
        .strip()
        .lower()

    ]


    if not district_data:

        raise HTTPException(

            status_code=404,

            detail=(
                f"District "
                f"'{district_name}' "
                "not found in latest "
                "predictions."
            ),

        )


    # --------------------------------------------------------
    # Find statewide rank
    # --------------------------------------------------------

    ranking = load_ranking()


    district_rank = next(

        (

            row

            for row in ranking

            if row["district"]
            .strip()
            .lower()
            ==
            district_name
            .strip()
            .lower()

        ),

        None,
    )


    # --------------------------------------------------------
    # Average surge probability
    # --------------------------------------------------------

    probabilities = [

        float(
            row["surge_probability"]
        )

        for row in district_data

    ]


    average_probability = (

        sum(probabilities)
        / len(probabilities)

    )


    # --------------------------------------------------------
    # Two-week forecast
    # --------------------------------------------------------

    forecast = []


    for row in district_data:

        forecast.append(
            {

                "disease":
                    row["disease"],

                "expected_cases_2w":
                    int(
                        float(
                            row[
                                "expected_cases_2w"
                            ]
                        )
                    ),

                "surge_probability":
                    float(
                        row[
                            "surge_probability"
                        ]
                    ),

                "risk_level":
                    row[
                        "risk_level"
                    ].upper(),

                "year":
                    int(
                        row["year"]
                    ),

                "week_number":
                    int(
                        row[
                            "week_number"
                        ]
                    ),

            }
        )


    # --------------------------------------------------------
    # Final district response
    # --------------------------------------------------------

    return {

        "success": True,

        "district":
            district_data[0][
                "district"
            ],

        "rank":
            (
                district_rank["rank"]
                if district_rank
                else None
            ),

        "risk_score":
            (
                district_rank[
                    "risk_score"
                ]
                if district_rank
                else None
            ),

        "average_surge_probability":
            round(
                average_probability,
                4,
            ),

        "year":
            latest_year,

        "week_number":
            latest_week,

        "forecast_2w":
            forecast,

    }


# ============================================================
# ALL DISTRICTS
# ============================================================

@router.get("")
def get_all_districts(
    params: CommonQueryParams = Depends(get_common_query_params),
):

    ranking = load_ranking()

    districts = [
        row["district"]
        for row in ranking
    ]

    result = paginate_items(
        districts,
        params.page,
        params.page_size,
    )

    return {
        "success": True,
        "total_districts": len(districts),
        "data": result["items"],
        "pagination": result["pagination"],
    }


