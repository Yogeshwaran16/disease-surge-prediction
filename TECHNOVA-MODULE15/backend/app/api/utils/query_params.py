from typing import Optional

from fastapi import Query
from pydantic import BaseModel, Field


class CommonQueryParams(BaseModel):
    district: Optional[str] = None
    disease: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_common_query_params(
    district: Optional[str] = Query(
        default=None,
        description="Filter by district"
    ),
    disease: Optional[str] = Query(
        default=None,
        description="Filter by disease"
    ),
    start_date: Optional[str] = Query(
        default=None,
        description="Start date (YYYY-MM-DD)"
    ),
    end_date: Optional[str] = Query(
        default=None,
        description="End date (YYYY-MM-DD)"
    ),
    page: int = Query(
        default=1,
        ge=1,
        description="Page number"
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Number of records per page"
    ),
) -> CommonQueryParams:

    return CommonQueryParams(
        district=district,
        disease=disease,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
    )


def paginate_items(items: list, page: int, page_size: int) -> dict:
    total = len(items)

    start = (page - 1) * page_size
    end = start + page_size

    paginated_items = items[start:end]

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return {
        "items": paginated_items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": end < total,
            "has_previous": page > 1,
        },
    }


def apply_filters(
    items: list[dict],
    district: Optional[str] = None,
    disease: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> list[dict]:

    filtered = items

    if district:
        filtered = [
            item for item in filtered
            if str(item.get("district", "")).lower()
            == district.lower()
        ]

    if disease:
        filtered = [
            item for item in filtered
            if str(item.get("disease", "")).lower()
            == disease.lower()
        ]

    if start_date:
        filtered = [
            item for item in filtered
            if str(item.get("date", "")) >= start_date
        ]

    if end_date:
        filtered = [
            item for item in filtered
            if str(item.get("date", "")) <= end_date
        ]

    return filtered