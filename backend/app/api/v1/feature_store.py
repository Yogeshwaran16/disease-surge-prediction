from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session


from app.database import (
    get_db,
)

from app.repositories.feature_store_repository import (
    FeatureStoreRepository,
)


# ============================================
# ROUTER
# ============================================

router = APIRouter(

    prefix="/features",

    tags=[
        "Feature Store",
    ],

)


# ============================================
# FEATURE STORE HEALTH
# ============================================

@router.get(
    "/health"
)

def feature_store_health():

    return {

        "success":
            True,

        "service":
            "Feature Store",

        "status":
            "healthy",

    }


# ============================================
# GET FEATURE DISTRICTS
# ============================================

@router.get(
    "/districts"
)

def get_feature_districts(

    db: Session = Depends(
        get_db
    ),

):

    repository = FeatureStoreRepository(
        db
    )


    districts = (
        repository
        .get_unique_districts()
    )


    return {

        "success":
            True,

        "count":
            len(
                districts
            ),

        "data":
            districts,

    }


# ============================================
# GET FEATURE DISEASES
# ============================================

@router.get(
    "/diseases"
)

def get_feature_diseases(

    db: Session = Depends(
        get_db
    ),

):

    repository = FeatureStoreRepository(
        db
    )


    diseases = (
        repository
        .get_unique_diseases()
    )


    return {

        "success":
            True,

        "count":
            len(
                diseases
            ),

        "data":
            diseases,

    }


# ============================================
# GET FEATURES BY DISTRICT + DISEASE
# IMPORTANT:
# STATIC ROUTE BEFORE DYNAMIC ROUTES
# ============================================

@router.get(
    "/search"
)

def get_features_by_district_and_disease(

    district: str,

    disease: str,

    db: Session = Depends(
        get_db
    ),

):

    repository = FeatureStoreRepository(
        db
    )


    features = (
        repository.get_features(

            district=district,

            disease=disease,

        )
    )


    return {

        "success":
            True,

        "district":
            district,

        "disease":
            disease,

        "count":
            len(
                features
            ),

        "data":
            features,

    }


# ============================================
# GET FEATURE COUNT
# ============================================

@router.get(
    "/count"
)

def get_feature_count(

    db: Session = Depends(
        get_db
    ),

):

    repository = FeatureStoreRepository(
        db
    )


    total = (
        repository
        .count_features()
    )


    return {

        "success":
            True,

        "total":
            total,

    }


# ============================================
# GET LATEST FEATURE
# ============================================

@router.get(
    "/latest/{district}/{disease}"
)

def get_latest_feature(

    district: str,

    disease: str,

    db: Session = Depends(
        get_db
    ),

):

    repository = FeatureStoreRepository(
        db
    )


    feature = (
        repository.get_latest(

            district=district,

            disease=disease,

        )
    )


    if not feature:

        raise HTTPException(

            status_code=404,

            detail=(
                f"No feature found for "
                f"{district} - {disease}"
            ),

        )


    return {

        "success":
            True,

        "data":
            feature,

    }


# ============================================
# GET FEATURES BY DISTRICT
# ============================================

@router.get(
    "/district/{district}"
)

def get_features_by_district(

    district: str,

    db: Session = Depends(
        get_db
    ),

):

    repository = FeatureStoreRepository(
        db
    )


    features = (
        repository.get_by_district(

            district=district

        )
    )


    return {

        "success":
            True,

        "district":
            district,

        "count":
            len(
                features
            ),

        "data":
            features,

    }


# ============================================
# GET ALL FEATURES
# KEEP THIS LAST
# ============================================

@router.get(
    ""
)

def get_all_features(

    skip: int = 0,

    limit: int = 100,

    db: Session = Depends(
        get_db
    ),

):


    # ========================================
    # INPUT VALIDATION
    # ========================================

    if skip < 0:

        raise HTTPException(

            status_code=400,

            detail=(
                "Skip cannot be negative"
            ),

        )


    if limit < 1:

        raise HTTPException(

            status_code=400,

            detail=(
                "Limit must be at least 1"
            ),

        )


    if limit > 10000:

        limit = 10000


    repository = FeatureStoreRepository(
        db
    )


    features = (
        repository.get_all(

            skip=skip,

            limit=limit,

        )
    )


    return {

        "success":
            True,

        "count":
            len(
                features
            ),

        "skip":
            skip,

        "limit":
            limit,

        "data":
            features,

    }