from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.core.security import decode_token

from app.resource_planning.priority_engine import get_priority
from app.resource_planning.action_engine import get_recommended_actions
from app.resource_planning.resource_data import get_district_resources
from app.resource_planning.allocation_matrix import get_allocation_percentages


router = APIRouter(
    prefix="/resource-planning",
    tags=["Resource Planning"],
)

security = HTTPBearer()


class ResourcePlanningRequest(BaseModel):
    district: str
    disease: str = "Dengue"
    risk_level: str
    expected_cases_2w: int = 100


def calculate_resources(
    district: str,
    risk_level: str,
    expected_cases: int,
):
    risk = str(risk_level).upper().strip()

    multiplier = {
        "CRITICAL": 2.00,
        "HIGH": 1.50,
        "MEDIUM": 1.00,
        "LOW": 0.75,
    }.get(risk, 0.75)

    available_resources = get_district_resources(district)

    beds_required = max(
        20,
        int(expected_cases * 0.20 * multiplier),
    )

    ambulances_required = max(
        2,
        int((expected_cases / 50) * multiplier),
    )

    staff_required = max(
        10,
        int(expected_cases * 0.30 * multiplier),
    )

    test_kits_required = max(
        100,
        int(expected_cases * 3 * multiplier),
    )

    resources = [
        {
            "resource": "Hospital Beds",
            "available": available_resources.get(
                "Hospital Beds", 0
            ),
            "required": beds_required,
        },
        {
            "resource": "Ambulances",
            "available": available_resources.get(
                "Ambulances", 0
            ),
            "required": ambulances_required,
        },
        {
            "resource": "Medical Staff",
            "available": available_resources.get(
                "Medical Staff", 0
            ),
            "required": staff_required,
        },
        {
            "resource": "Dengue Test Kits",
            "available": available_resources.get(
                "Dengue Test Kits", 0
            ),
            "required": test_kits_required,
        },
    ]

    for resource in resources:
        available = resource["available"]
        required = resource["required"]

        gap = max(0, required - available)

        resource["gap"] = gap

        if gap == 0:
            resource["status"] = "Available"
        elif gap <= required * 0.25:
            resource["status"] = "Warning"
        else:
            resource["status"] = "Critical"

    return resources


def calculate_surge_capacity(resources):
    """
    Calculate hospital surge-capacity indicator
    using available vs required hospital beds.
    """

    bed_resource = next(
        (
            resource
            for resource in resources
            if resource["resource"] == "Hospital Beds"
        ),
        None,
    )

    if not bed_resource:
        return {
            "percentage": 0,
            "status": "Unknown",
            "available_beds": 0,
            "required_beds": 0,
        }

    available = bed_resource["available"]
    required = bed_resource["required"]

    if required <= 0:
        percentage = 100
    else:
        percentage = round(
            min((available / required) * 100, 100),
            2,
        )

    if percentage >= 150:
        status = "High Capacity"
    elif percentage >= 100:
        status = "Adequate Capacity"
    elif percentage >= 75:
        status = "Limited Capacity"
    else:
        status = "Critical Capacity"

    return {
        "percentage": percentage,
        "status": status,
        "available_beds": available,
        "required_beds": required,
    }


@router.get("/health")
def resource_health():
    return {
        "success": True,
        "service": "Resource Planning",
        "status": "healthy",
    }


@router.post("/generate")
def generate_resource_plan(
    data: ResourcePlanningRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token_data = decode_token(credentials.credentials)

    if not token_data or token_data.get("type") != "access":
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token",
        )

    allocation_percentages = get_allocation_percentages(
        data.risk_level
    )

    resources = calculate_resources(
        district=data.district,
        risk_level=data.risk_level,
        expected_cases=data.expected_cases_2w,
    )

    shortage_count = sum(
        1
        for resource in resources
        if resource["gap"] > 0
    )

    total_resource_gap = sum(
        resource["gap"]
        for resource in resources
    )

    critical_shortages = sum(
        1
        for resource in resources
        if resource["status"] == "Critical"
    )

    priority = get_priority(
        data.risk_level,
        shortage_count,
    )

    recommended_actions = get_recommended_actions(
        data.risk_level,
        shortage_count,
    )

    surge_capacity = calculate_surge_capacity(
        resources
    )

    return {
        "success": True,
        "message": "Resource plan generated successfully",
        "data": {
            "district": data.district,
            "disease": data.disease,
            "risk_level": data.risk_level.upper(),
            "expected_cases_2w": data.expected_cases_2w,
            "allocation_percentages": allocation_percentages,
            "resources": resources,
            "shortage_count": shortage_count,
            "total_resource_gap": total_resource_gap,
            "critical_shortages": critical_shortages,
            "priority": priority,
            "recommended_actions": recommended_actions,
            "surge_capacity": surge_capacity,
        },
    }