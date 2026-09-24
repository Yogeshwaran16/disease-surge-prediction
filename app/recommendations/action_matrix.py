"""
Recommendation Action Matrix
============================

Maps disease outbreak risk levels to operational
response actions.
"""


# ============================================
# RESPONSE CATEGORIES
# ============================================

FOGGING = "fogging"

HOSPITAL_PREPAREDNESS = "hospital_preparedness"

MEDICINE_ALLOCATION = "medicine_allocation"

HEALTH_WORKER_DEPLOYMENT = "health_worker_deployment"

PUBLIC_AWARENESS = "public_awareness"


# ============================================
# RISK ACTION MATRIX
# ============================================

ACTION_MATRIX = {

    # ========================================
    # LOW RISK
    # ========================================

    "LOW": [

        {
            "category": FOGGING,
            "action": "Conduct routine mosquito surveillance",
            "priority": 30,
        },

        {
            "category": HOSPITAL_PREPAREDNESS,
            "action": "Maintain normal hospital preparedness",
            "priority": 25,
        },

        {
            "category": MEDICINE_ALLOCATION,
            "action": "Monitor essential medicine stock levels",
            "priority": 35,
        },

        {
            "category": HEALTH_WORKER_DEPLOYMENT,
            "action": "Continue routine health worker deployment",
            "priority": 30,
        },

        {
            "category": PUBLIC_AWARENESS,
            "action": "Share general disease prevention awareness",
            "priority": 40,
        },
    ],


    # ========================================
    # MEDIUM RISK
    # ========================================

    "MEDIUM": [

        {
            "category": FOGGING,
            "action": "Increase fogging and vector control activities",
            "priority": 55,
        },

        {
            "category": HOSPITAL_PREPAREDNESS,
            "action": "Prepare additional hospital beds and staff",
            "priority": 60,
        },

        {
            "category": MEDICINE_ALLOCATION,
            "action": "Increase allocation of essential medicines",
            "priority": 65,
        },

        {
            "category": HEALTH_WORKER_DEPLOYMENT,
            "action": "Deploy additional health workers to high-risk areas",
            "priority": 60,
        },

        {
            "category": PUBLIC_AWARENESS,
            "action": "Launch targeted public awareness campaigns",
            "priority": 70,
        },
    ],


    # ========================================
    # HIGH RISK
    # ========================================

    "HIGH": [

        {
            "category": FOGGING,
            "action": "Conduct intensive fogging in identified hotspot areas",
            "priority": 85,
        },

        {
            "category": FOGGING,
            "action": "Eliminate mosquito breeding sites immediately",
            "priority": 80,
        },

        {
            "category": HOSPITAL_PREPAREDNESS,
            "action": "Activate surge hospital preparedness plan",
            "priority": 90,
        },

        {
            "category": HOSPITAL_PREPAREDNESS,
            "action": "Reserve additional beds for outbreak patients",
            "priority": 85,
        },

        {
            "category": MEDICINE_ALLOCATION,
            "action": "Allocate emergency medicine reserves",
            "priority": 90,
        },

        {
            "category": MEDICINE_ALLOCATION,
            "action": "Increase diagnostic kit availability",
            "priority": 85,
        },

        {
            "category": HEALTH_WORKER_DEPLOYMENT,
            "action": "Deploy rapid response health teams",
            "priority": 90,
        },

        {
            "category": HEALTH_WORKER_DEPLOYMENT,
            "action": "Assign additional field surveillance workers",
            "priority": 80,
        },

        {
            "category": PUBLIC_AWARENESS,
            "action": "Issue district-level disease prevention alert",
            "priority": 85,
        },

        {
            "category": PUBLIC_AWARENESS,
            "action": "Conduct emergency community awareness programs",
            "priority": 80,
        },
    ],


    # ========================================
    # CRITICAL RISK
    # ========================================

    "CRITICAL": [

        {
            "category": FOGGING,
            "action": "Immediately deploy emergency fogging operations",
            "priority": 100,
        },

        {
            "category": FOGGING,
            "action": "Conduct daily vector control in outbreak hotspots",
            "priority": 95,
        },

        {
            "category": HOSPITAL_PREPAREDNESS,
            "action": "Activate emergency hospital response protocol",
            "priority": 100,
        },

        {
            "category": HOSPITAL_PREPAREDNESS,
            "action": "Prepare emergency isolation and treatment capacity",
            "priority": 95,
        },

        {
            "category": MEDICINE_ALLOCATION,
            "action": "Immediately release emergency medicine reserves",
            "priority": 100,
        },

        {
            "category": MEDICINE_ALLOCATION,
            "action": "Transfer critical medicines to affected hospitals",
            "priority": 95,
        },

        {
            "category": HEALTH_WORKER_DEPLOYMENT,
            "action": "Deploy emergency rapid response teams immediately",
            "priority": 100,
        },

        {
            "category": HEALTH_WORKER_DEPLOYMENT,
            "action": "Mobilize additional health workers from nearby districts",
            "priority": 95,
        },

        {
            "category": PUBLIC_AWARENESS,
            "action": "Issue emergency public health alert",
            "priority": 100,
        },

        {
            "category": PUBLIC_AWARENESS,
            "action": "Launch emergency mass communication campaign",
            "priority": 95,
        },

        {
            "category": PUBLIC_AWARENESS,
            "action": "Notify District Health Officer immediately",
            "priority": 100,
        },

        {
            "category": HOSPITAL_PREPAREDNESS,
            "action": "Initiate emergency resource transfer planning",
            "priority": 98,
        },
    ],
}


# ============================================
# GET ACTIONS FOR RISK
# ============================================

def get_actions_for_risk(
    risk_level: str,
) -> list[dict]:
    """
    Return all actions for a given risk level.

    Example:
        get_actions_for_risk("HIGH")
    """

    normalized_risk = (
        risk_level
        .strip()
        .upper()
    )

    if normalized_risk not in ACTION_MATRIX:

        raise ValueError(
            f"Unsupported risk level: {risk_level}"
        )

    return ACTION_MATRIX[
        normalized_risk
    ]


# ============================================
# GET ACTIONS BY CATEGORY
# ============================================

def get_actions_by_category(
    risk_level: str,
    category: str,
) -> list[dict]:
    """
    Return actions for a risk level
    filtered by response category.
    """

    actions = get_actions_for_risk(
        risk_level
    )

    normalized_category = (
        category
        .strip()
        .lower()
    )

    return [

        action

        for action in actions

        if action["category"] == normalized_category

    ]


# ============================================
# GET ALL CATEGORIES
# ============================================

def get_all_categories() -> list[str]:
    """
    Return all supported response categories.
    """

    return [

        FOGGING,

        HOSPITAL_PREPAREDNESS,

        MEDICINE_ALLOCATION,

        HEALTH_WORKER_DEPLOYMENT,

        PUBLIC_AWARENESS,

    ]


# ============================================
# VALIDATE RISK LEVEL
# ============================================

def is_valid_risk_level(
    risk_level: str,
) -> bool:
    """
    Check whether the given risk level
    is supported.
    """

    if not isinstance(
        risk_level,
        str,
    ):
        return False

    return (
        risk_level
        .strip()
        .upper()
        in ACTION_MATRIX
    )