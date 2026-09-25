import schemathesis
from app.main import app

schema = schemathesis.openapi.from_asgi(
    "/openapi.json",
    app,
)

health_schema = schema.include(
    path=[
        "/",
        "/health",
        "/api/v1/recommendations/health",
        "/api/v1/resource-planning/health",
        "/api/v1/dashboard/health",
        "/api/v1/agents/health",
    ],
    method="GET",
)


@health_schema.parametrize()
def test_health_api_contract(case):
    case.call_and_validate()
