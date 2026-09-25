const { test, expect } = require("@playwright/test");

test.describe("Login E2E", () => {

  test("renders login form", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByPlaceholder("Enter your email")
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("Enter your password")
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Login" })
    ).toBeVisible();
  });


  test("logs in successfully with mocked API", async ({ page }) => {

    await page.route(
      "http://localhost:5000/api/auth/login",
      async (route) => {

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            accessToken: "playwright-test-access-token",
            refreshToken: "playwright-test-refresh-token",
            user: {
              id: "playwright-test-user",
              name: "Playwright Test User",
              email: "playwright@test.com",
              role: "VIEWER",
              district: "Chennai"
            }
          })
        });

      }
    );


    await page.goto("/login");


    await page.getByPlaceholder("Enter your email").fill(
      "playwright@test.com"
    );

    await page.getByPlaceholder("Enter your password").fill(
      "TestPassword123!"
    );


    await page.getByRole("button", {
      name: "Login"
    }).click();


    await expect(page).toHaveURL(/\/$/);


    await expect
      .poll(async () =>
        page.evaluate(() =>
          localStorage.getItem("accessToken")
        )
      )
      .toBe("playwright-test-access-token");


    await expect
      .poll(async () =>
        page.evaluate(() =>
          localStorage.getItem("refreshToken")
        )
      )
      .toBe("playwright-test-refresh-token");


    const user = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("user"))
    );

    expect(user.email).toBe("playwright@test.com");
    expect(user.role).toBe("VIEWER");
  });

});
