# ============================================
# DISTRICT RESOURCE AVAILABILITY DATA
# ============================================

DISTRICT_RESOURCES = {

    "Chennai": {

        "Hospital Beds": 820,

        "Ambulances": 120,

        "Medical Staff": 950,

        "Dengue Test Kits": 4500,

    },


    "Coimbatore": {

        "Hospital Beds": 650,

        "Ambulances": 90,

        "Medical Staff": 780,

        "Dengue Test Kits": 3800,

    },


    "Madurai": {

        "Hospital Beds": 420,

        "Ambulances": 60,

        "Medical Staff": 520,

        "Dengue Test Kits": 2500,

    },


    "Salem": {

        "Hospital Beds": 350,

        "Ambulances": 45,

        "Medical Staff": 430,

        "Dengue Test Kits": 2000,

    },


    "Tiruchirappalli": {

        "Hospital Beds": 380,

        "Ambulances": 50,

        "Medical Staff": 460,

        "Dengue Test Kits": 2200,

    },


    "Tirunelveli": {

        "Hospital Beds": 300,

        "Ambulances": 35,

        "Medical Staff": 380,

        "Dengue Test Kits": 1800,

    },


    "Default": {

        "Hospital Beds": 250,

        "Ambulances": 30,

        "Medical Staff": 300,

        "Dengue Test Kits": 1500,

    },

}


# ============================================
# GET DISTRICT RESOURCES
# ============================================

def get_district_resources(
    district: str,
):

    clean_district = (
        str(district)
        .strip()
        .title()
    )


    return DISTRICT_RESOURCES.get(

        clean_district,

        DISTRICT_RESOURCES[
            "Default"
        ],

    )