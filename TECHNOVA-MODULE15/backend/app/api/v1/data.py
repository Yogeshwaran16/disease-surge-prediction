from fastapi import APIRouter, Depends

from app.api.utils.auth import get_current_user
from app.api.utils.query_params import (
    CommonQueryParams,
    apply_filters,
    get_common_query_params,
    paginate_items,
)


router = APIRouter(
    prefix="/api/v1/data",
    tags=["Platform Data"],
)


SAMPLE_DATA = [
    {
        "id": 1,
        "district": "Chennai",
        "disease": "Dengue",
        "date": "2026-01-10",
        "cases": 45,
    },
    {
        "id": 2,
        "district": "Madurai",
        "disease": "Dengue",
        "date": "2026-01-15",
        "cases": 32,
    },
    {
        "id": 3,
        "district": "Coimbatore",
        "disease": "Malaria",
        "date": "2026-02-05",
        "cases": 21,
    },
    {
        "id": 4,
        "district": "Chennai",
        "disease": "Influenza",
        "date": "2026-02-20",
        "cases": 67,
    },
    {
        "id": 5,
        "district": "Salem",
        "disease": "Chikungunya",
        "date": "2026-03-01",
        "cases": 18,
    },
    {
        "id": 6,
        "district": "Madurai",
        "disease": "Malaria",
        "date": "2026-03-10",
        "cases": 29,
    },
]


@router.get("")
def get_platform_data(
    params: CommonQueryParams = Depends(get_common_query_params),
    current_user: dict = Depends(get_current_user),
):
    filtered_data = apply_filters(
        items=SAMPLE_DATA,
        district=params.district,
        disease=params.disease,
        start_date=params.start_date,
        end_date=params.end_date,
    )

    result = paginate_items(
        items=filtered_data,
        page=params.page,
        page_size=params.page_size,
    )

    return {
        "message": "Platform data retrieved successfully",
        "filters": {
            "district": params.district,
            "disease": params.disease,
            "start_date": params.start_date,
            "end_date": params.end_date,
        },
        **result,
    }