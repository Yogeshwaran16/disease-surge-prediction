import asyncio
from datetime import datetime, timezone

from app.services.dashboard_service import DashboardService


class DashboardAgent:

    def __init__(self, broadcast_callback=None):
        self.broadcast_callback = broadcast_callback
        self.running = False

    # ============================================
    # GET DASHBOARD DATA
    # ============================================

    def get_dashboard_data(self, predictions=None):

        return DashboardService.build_dashboard(
            predictions
        )

    # ============================================
    # PUSH UPDATE
    # ============================================

    async def push_update(self, predictions=None):

        dashboard_data = self.get_dashboard_data(
            predictions
        )

        dashboard_data["event"] = (
            "dashboard_update"
        )

        dashboard_data["timestamp"] = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )

        if self.broadcast_callback:

            await self.broadcast_callback(
                dashboard_data
            )

        return dashboard_data

    # ============================================
    # START AGENT
    # ============================================

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

                if predictions_provider:

                    result = predictions_provider()

                    if asyncio.iscoroutine(result):

                        predictions = await result

                    else:

                        predictions = result

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
                    str(error),
                )

                await asyncio.sleep(
                    interval
                )

        print(
            "Dashboard Agent Stopped"
        )

    # ============================================
    # STOP AGENT
    # ============================================

    def stop(self):

        self.running = False


dashboard_agent = DashboardAgent()