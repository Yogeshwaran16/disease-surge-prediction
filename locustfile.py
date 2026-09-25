from locust import HttpUser, task, between


class BackendLoadTest(HttpUser):
    host = "http://localhost:5000"
    wait_time = between(1, 3)

    @task(3)
    def backend_health(self):
        self.client.get(
            "/api/health",
            name="Backend Health"
        )


class AILoadTest(HttpUser):
    host = "http://localhost:8001"
    wait_time = between(1, 3)

    @task(3)
    def ai_health(self):
        self.client.get(
            "/health",
            name="AI Health"
        )
