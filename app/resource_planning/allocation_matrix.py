"""
Resource Allocation Matrix
==========================

Risk-based allocation percentages for Module 11.
These percentages are applied to the resource requirement
calculated by the Resource Planning engine.
"""

ALLOCATION_MATRIX = {
    "LOW": {
        "hospital_beds": 75,
        "ambulances": 75,
        "medical_staff": 75,
        "dengue_test_kits": 75,
    },
    "MEDIUM": {
        "hospital_beds": 100,
        "ambulances": 100,
        "medical_staff": 100,
        "dengue_test_kits": 100,
    },
    "HIGH": {
        "hospital_beds": 125,
        "ambulances": 125,
        "medical_staff": 125,
        "dengue_test_kits": 125,
    },
    "CRITICAL": {
        "hospital_beds": 150,
        "ambulances": 150,
        "medical_staff": 150,
        "dengue_test_kits": 150,
    },
}


def get_allocation_percentages(risk_level: str) -> dict:
    """
    Return resource allocation percentages for a risk level.
    """

    normalized_risk = str(risk_level).strip().upper()

    if normalized_risk not in ALLOCATION_MATRIX:
        raise ValueError(
            f"Unsupported risk level: {risk_level}"
        )

    return ALLOCATION_MATRIX[normalized_risk].copy()
