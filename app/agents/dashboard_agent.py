import asyncio

from datetime import datetime, timezone

from app.services.dashboard_service import (
    DashboardService,
)


# ============================================
# DASHBOARD AGENT
# ============================================

class DashboardAgent:

    def __init__(
        self,
        broadcast_callback=None,
    ):

        self.broadcast_callback = (
            broadcast_callback
        )

        self.running = False


    # ========================================
    # BUILD CURRENT DASHBOARD
    # ========================================

    def get_dashboard_data(
        self,
        predictions=None,
    ):

        if predictions is None:
            predictions = []

        normalized_predictions = []

        for prediction in predictions:

            normalized_predictions.append({

                "district":
                    prediction.get(
                        "district",
                        "Unknown"
                    ),

                "disease":
                    prediction.get(
                        "disease",
                        "Unknown"
                    ),

                "risk_level":
                    prediction.get(
                        "risk_level",
                        "LOW"
                    ),

                "probability":
                    prediction.get(
                        "probability",
                        prediction.get(
                            "surge_probability",
                            0
                        )
                    ),

                "cases":
                    prediction.get(
                        "cases",
                        prediction.get(
                            "expected_cases_2w",
                            0
                        )
                    ),

                "updated_at":
                    prediction.get(
                        "updated_at",
                        prediction.get(
                            "generated_at",
                            None
                        )
                    ),

            })

        return (
            DashboardService.build_dashboard(
                normalized_predictions
            )
        )


    # ========================================
    # SEND DASHBOARD UPDATE
    # ========================================

    async def push_update(
        self,
        predictions=None,
    ):

        dashboard_data = (
            self.get_dashboard_data(
                predictions
            )
        )

        dashboard_data[
            "event"
        ] = "dashboard_update"

        dashboard_data[
            "timestamp"
        ] = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )

        if self.broadcast_callback:

            await self.broadcast_callback(
                dashboard_data
            )

        return dashboard_data


    # ========================================
    # START CONTINUOUS AGENT
    # ========================================

    async def start(
        self,
        predictions_provider=None,
        interval=10,
    ):

        if self.running:
            return

        self.running = True

        print(
            "Dashboard Agent Started"
        )

        while self.running:

            try:

                predictions = []

                # ====================================
                # GET LIVE DASHBOARD PREDICTIONS
                # ====================================

                if predictions_provider:

                    result = (
                        predictions_provider()
                    )

                    if asyncio.iscoroutine(
                        result
                    ):

                        predictions = (
                            await result
                        )

                    else:

                        predictions = result

                # ====================================
                # PUSH UPDATE
                # ====================================

                await self.push_update(
                    predictions
                )

                await asyncio.sleep(
                    interval
                )

            except asyncio.CancelledError:

                break

            except Exception as error:

                print(
                    "Dashboard Agent Error:",
                    str(error)
                )

                await asyncio.sleep(
                    interval
                )

        print(
            "Dashboard Agent Stopped"
        )


    # ========================================
    # STOP AGENT
    # ========================================

    def stop(self):

        self.running = False


# ============================================
# GLOBAL AGENT INSTANCE
# ============================================

dashboard_agent = DashboardAgent()