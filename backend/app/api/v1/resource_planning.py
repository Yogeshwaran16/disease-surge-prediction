from fastapi import (
    APIRouter,
)

from pydantic import (
    BaseModel,
)

from app.resource_planning.priority_engine import (
    get_priority,
)

from app.resource_planning.action_engine import (
    get_recommended_actions,
)

from app.resource_planning.resource_data import (
    get_district_resources,
)


# ============================================
# ROUTER
# ============================================

router = APIRouter(

    prefix="/resource-planning",

    tags=[
        "Resource Planning"
    ],

)


# ============================================
# REQUEST MODEL
# ============================================

class ResourcePlanningRequest(
    BaseModel
):

    district: str

    disease: str = "Dengue"

    risk_level: str

    expected_cases_2w: int = 100


# ============================================
# RESOURCE CALCULATOR
# ============================================

def calculate_resources(

    district: str,

    risk_level: str,

    expected_cases: int,

):

    risk = (

        str(
            risk_level
        )
        .upper()
        .strip()

    )


    # ========================================
    # RISK MULTIPLIER
    # ========================================

    multiplier = {

        "CRITICAL": 2.00,

        "HIGH": 1.50,

        "MEDIUM": 1.00,

        "LOW": 0.75,

    }.get(

        risk,

        0.75

    )


    # ========================================
    # DISTRICT AVAILABLE RESOURCES
    # ========================================

    available_resources = (

        get_district_resources(
            district
        )

    )


    # ========================================
    # REQUIRED RESOURCES
    # ========================================

    beds_required = max(

        20,

        int(
            expected_cases
            * 0.20
            * multiplier
        )

    )


    ambulances_required = max(

        2,

        int(
            (
                expected_cases
                / 50
            )
            * multiplier
        )

    )


    staff_required = max(

        10,

        int(
            expected_cases
            * 0.30
            * multiplier
        )

    )


    test_kits_required = max(

        100,

        int(
            expected_cases
            * 3
            * multiplier
        )

    )


    # ========================================
    # RESOURCE LIST
    # ========================================

    resources = [

        {

            "resource":
                "Hospital Beds",

            "available":
                available_resources.get(
                    "Hospital Beds",
                    0
                ),

            "required":
                beds_required,

        },


        {

            "resource":
                "Ambulances",

            "available":
                available_resources.get(
                    "Ambulances",
                    0
                ),

            "required":
                ambulances_required,

        },


        {

            "resource":
                "Medical Staff",

            "available":
                available_resources.get(
                    "Medical Staff",
                    0
                ),

            "required":
                staff_required,

        },


        {

            "resource":
                "Dengue Test Kits",

            "available":
                available_resources.get(
                    "Dengue Test Kits",
                    0
                ),

            "required":
                test_kits_required,

        },

    ]


    # ========================================
    # CALCULATE GAP + STATUS
    # ========================================

    for resource in resources:

        available = (
            resource["available"]
        )

        required = (
            resource["required"]
        )


        gap = max(

            0,

            required
            - available

        )


        resource["gap"] = gap


        # ====================================
        # STATUS
        # ====================================

        if gap == 0:

            resource["status"] = (
                "Available"
            )


        elif gap <= required * 0.25:

            resource["status"] = (
                "Warning"
            )


        else:

            resource["status"] = (
                "Critical"
            )


    return resources


# ============================================
# HEALTH
# ============================================

@router.get(
    "/health"
)

def resource_health():

    return {

        "success":
            True,

        "service":
            "Resource Planning",

        "status":
            "healthy",

    }


# ============================================
# GENERATE RESOURCE PLAN
# ============================================

@router.post(
    "/generate"
)

def generate_resource_plan(

    data:
        ResourcePlanningRequest

):

    # ========================================
    # CALCULATE RESOURCES
    # ========================================

    allocation_percentages = get_allocation_percentages(
        data.risk_level
    )

    resources = (

        calculate_resources(

            district=
                data.district,

            risk_level=
                data.risk_level,

            expected_cases=
                data.expected_cases_2w,

        )

    )


    # ========================================
    # SHORTAGE COUNT
    # ========================================

    shortage_count = sum(

        1

        for resource in resources

        if resource["gap"] > 0

    )


    # ========================================
    # TOTAL RESOURCE GAP
    # ========================================

    total_resource_gap = sum(

        resource["gap"]

        for resource in resources

    )


    # ========================================
    # CRITICAL SHORTAGE COUNT
    # ========================================

    critical_shortages = sum(

        1

        for resource in resources

        if resource["status"]
        == "Critical"

    )


    # ========================================
    # PRIORITY
    # ========================================

    priority = (

        get_priority(

            data.risk_level,

            shortage_count,

        )

    )


    # ========================================
    # RECOMMENDED ACTIONS
    # ========================================

    recommended_actions = (

        get_recommended_actions(

            data.risk_level,

            shortage_count,

        )

    )


    # ========================================
    # RESPONSE
    # ========================================

    return {

        "success":
            True,

        "message":
            "Resource plan generated successfully",

        "data": {

            "district":
                data.district,

            "disease":
                data.disease,

            "risk_level":
                data.risk_level
                .upper(),

            "expected_cases_2w":
                data.expected_cases_2w,

            "shortage_count":
                shortage_count,

            "critical_shortages":
                critical_shortages,

            "total_resource_gap":
                total_resource_gap,

            "priority":
                priority,

            "recommended_actions":
                recommended_actions,

            "allocation_percentages":
                allocation_percentages,

            "resources":
                resources,

        },

    }


# ============================================
# TEST ENDPOINT
# ============================================

@router.get(
    "/test"
)

def resource_test():

    return {

        "success":
            True,

        "message":
            "Resource Planning API working",

    }

from app.resource_planning.allocation_matrix import get_allocation_percentages

