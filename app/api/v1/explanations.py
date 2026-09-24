from fastapi import (
    APIRouter,
    HTTPException,
    status,
    Depends,
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from app.core.security import (
    decode_token,
)

from app.schemas.explanation import (
    ExplainPredictionRequest,
    ExplanationResponse,
)

from app.services.explanation_service import (
    ExplanationService,
)

from app.explainability.model_loader import (
    model_loader,
)


router = APIRouter(
    prefix="/explanations",
    tags=["Explainability"],
)


# =====================================================
# SECURITY
# =====================================================

security = HTTPBearer()


# =====================================================
# LOAD TRAINED PREDICTION MODEL
# =====================================================

try:

    prediction_model, prediction_scaler = (
        model_loader.load()
    )

except Exception as error:

    print(
        f"⚠️ Failed to load prediction model: {error}"
    )

    prediction_model = None
    prediction_scaler = None


# =====================================================
# EXPLANATION SERVICE
# =====================================================

def get_explanation_service() -> ExplanationService:

    if prediction_model is None:

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Prediction model is not available. "
                "Connect the trained model to the "
                "Explanation Service first."
            ),
        )

    return ExplanationService(
        model=prediction_model,
    )


# =====================================================
# GENERATE EXPLANATION
# =====================================================

@router.post(
    "/",
    response_model=ExplanationResponse,
    status_code=status.HTTP_200_OK,
)
def generate_explanation(
    request: ExplainPredictionRequest,

    credentials: HTTPAuthorizationCredentials =
        Depends(security),
):

    try:

        # =============================================
        # EXTRACT TOKEN
        # =============================================

        token = credentials.credentials


        # =============================================
        # DECODE TOKEN
        # =============================================

        payload = decode_token(
            token
        )


        # =============================================
        # TOKEN VALIDATION
        # =============================================

        if not payload:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )


        # =============================================
        # ACCESS TOKEN CHECK
        # =============================================

        if (
            payload.get("type")
            != "access"
        ):

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token",
            )


        # =============================================
        # GENERATE SHAP EXPLANATION
        # =============================================

        service = get_explanation_service()

        explanation = (
            service.generate_explanation(
                features=request.features,
                risk_level=request.risk_level,
                prediction_id=request.prediction_id,
            )
        )


        return ExplanationResponse(
            prediction_id=explanation.prediction_id,
            risk_level=explanation.risk_level,
            summary=explanation.summary,
            positive_factors=explanation.positive_factors,
            negative_factors=explanation.negative_factors,
            key_factors=[
                factor.model_dump()
                for factor in explanation.key_factors
            ],
            metadata=explanation.metadata,
        )


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Failed to generate explanation: "
                f"{str(error)}"
            ),
        )


# =====================================================
# HEALTH CHECK
# =====================================================

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
)
def explanation_health_check():

    return {

        "status": "healthy",

        "service": "explainability",

        "model_connected":
            prediction_model is not None,

        "scaler_connected":
            prediction_scaler is not None,

    }