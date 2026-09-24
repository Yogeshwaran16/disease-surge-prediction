from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.hospital_resource import HospitalResource
from app.core.security import decode_token


router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"],
)

security = HTTPBearer()


class HospitalResourceRequest(BaseModel):
    district: str = Field(..., min_length=1)
    hospital_beds: int = Field(..., ge=0)
    ambulances: int = Field(..., ge=0)
    medical_staff: int = Field(..., ge=0)
    dengue_test_kits: int = Field(..., ge=0)


@router.get("/{district_id}")
def get_hospital_resource(
    district_id: str,
    db: Session = Depends(get_db),
):
    resource = (
        db.query(HospitalResource)
        .filter(HospitalResource.district.ilike(district_id.strip()))
        .first()
    )

    if not resource:
        raise HTTPException(
            status_code=404,
            detail=f"Hospital resource data not found for district: {district_id}",
        )

    return {
        "success": True,
        "data": {
            "district": resource.district,
            "hospital_beds": resource.hospital_beds,
            "ambulances": resource.ambulances,
            "medical_staff": resource.medical_staff,
            "dengue_test_kits": resource.dengue_test_kits,
            "updated_at": resource.updated_at,
        },
    }


@router.put("/{district_id}")
def update_hospital_resource(
    district_id: str,
    data: HospitalResourceRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token_data = decode_token(credentials.credentials)

    if not token_data or token_data.get("type") != "access":
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token",
        )

    if data.district.strip().lower() != district_id.strip().lower():
        raise HTTPException(
            status_code=400,
            detail="District in URL and request body must match",
        )

    resource = (
        db.query(HospitalResource)
        .filter(HospitalResource.district.ilike(district_id.strip()))
        .first()
    )

    if not resource:
        raise HTTPException(
            status_code=404,
            detail=f"Hospital resource data not found for district: {district_id}",
        )

    resource.hospital_beds = data.hospital_beds
    resource.ambulances = data.ambulances
    resource.medical_staff = data.medical_staff
    resource.dengue_test_kits = data.dengue_test_kits

    db.commit()
    db.refresh(resource)

    return {
        "success": True,
        "message": "Hospital resource data updated successfully",
        "data": {
            "district": resource.district,
            "hospital_beds": resource.hospital_beds,
            "ambulances": resource.ambulances,
            "medical_staff": resource.medical_staff,
            "dengue_test_kits": resource.dengue_test_kits,
            "updated_at": resource.updated_at,
        },
    }