"""
Feature Mapper
==============

Maps technical machine learning feature names to
human-readable descriptions for disease predictions.
"""

from typing import Dict


class FeatureMapper:
    """
    Converts technical feature names into
    user-friendly feature labels and descriptions.
    """

    FEATURE_MAPPING: Dict[str, Dict[str, str]] = {

        # Weather Features
        "temperature": {
            "label": "Temperature",
            "description": "Average environmental temperature",
            "category": "Weather",
        },

        "avg_temperature": {
            "label": "Average Temperature",
            "description": "Average temperature recorded in the area",
            "category": "Weather",
        },

        "humidity": {
            "label": "Humidity",
            "description": "Percentage of moisture in the air",
            "category": "Weather",
        },

        "rainfall": {
            "label": "Rainfall",
            "description": "Amount of rainfall recorded in the area",
            "category": "Weather",
        },

        # Disease Features
        "previous_cases": {
            "label": "Previous Disease Cases",
            "description": "Number of disease cases reported previously",
            "category": "Disease History",
        },

        "case_count": {
            "label": "Current Case Count",
            "description": "Number of currently reported disease cases",
            "category": "Disease History",
        },

        "cases_last_week": {
            "label": "Cases Last Week",
            "description": "Number of disease cases reported during the previous week",
            "category": "Disease History",
        },

        "case_growth_rate": {
            "label": "Case Growth Rate",
            "description": "Rate at which disease cases are increasing",
            "category": "Disease Trend",
        },

        # Population Features
        "population": {
            "label": "Population",
            "description": "Total population of the location",
            "category": "Demographics",
        },

        "population_density": {
            "label": "Population Density",
            "description": "Number of people living per unit area",
            "category": "Demographics",
        },

        # Healthcare Features
        "hospital_capacity": {
            "label": "Hospital Capacity",
            "description": "Availability of hospital resources",
            "category": "Healthcare",
        },

        "healthcare_access": {
            "label": "Healthcare Access",
            "description": "Accessibility of healthcare facilities",
            "category": "Healthcare",
        },

        # Environmental Features
        "water_quality_index": {
            "label": "Water Quality",
            "description": "Quality and safety level of local water sources",
            "category": "Environment",
        },

        "sanitation_index": {
            "label": "Sanitation Level",
            "description": "Level of sanitation infrastructure in the area",
            "category": "Environment",
        },
    }

    @classmethod
    def get_feature_info(
        cls,
        feature_name: str,
    ) -> Dict[str, str]:
        """
        Return human-readable information for a feature.
        """

        if feature_name in cls.FEATURE_MAPPING:
            return cls.FEATURE_MAPPING[feature_name]

        # Fallback for unknown features
        return {
            "label": feature_name.replace("_", " ").title(),
            "description": (
                f"Model feature: {feature_name.replace('_', ' ')}"
            ),
            "category": "Other",
        }

    @classmethod
    def get_label(
        cls,
        feature_name: str,
    ) -> str:
        """
        Return user-friendly feature label.
        """

        return cls.get_feature_info(
            feature_name
        )["label"]

    @classmethod
    def get_description(
        cls,
        feature_name: str,
    ) -> str:
        """
        Return feature description.
        """

        return cls.get_feature_info(
            feature_name
        )["description"]

    @classmethod
    def get_category(
        cls,
        feature_name: str,
    ) -> str:
        """
        Return feature category.
        """

        return cls.get_feature_info(
            feature_name
        )["category"]

    @classmethod
    def map_feature(
        cls,
        feature_name: str,
    ) -> Dict[str, str]:
        """
        Return complete mapped feature information.
        """

        info = cls.get_feature_info(feature_name)

        return {
            "feature": feature_name,
            "label": info["label"],
            "description": info["description"],
            "category": info["category"],
        }