import { test, expect } from "@playwright/test"


// proves that a user can log in, click a card on the dashboard, and see the detail page
test("user can navigate from dashboard to a learning path detail page", async ({ page }) => {

  // first log in 
  await page.goto("/")
  await page.getByRole("button", { name: "Login" }).first().click()
  await page.getByLabel("Email").fill("davidaltaccount1234@gmail.com")
  await page.getByLabel("Password").fill("12345678")
  await page.getByRole("button", { name: "Login" }).last().click()

  // wait for dashboard to load after logging in
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible()

  // wait for at least one path card to appear on dashboard
  const firstCard = page.locator("h2").first()
  await expect(firstCard).toBeVisible({ timeout: 10000 })

  // click the first card to navigate to detail page
  await firstCard.click()

  // verify URL changed to /learning-path/{id}
  await expect(page).toHaveURL(/.*\/learning-path\/\d+/, { timeout: 5000 })

  // there should also be a back button in the detail page itself
  await expect(page.getByRole("button", { name: /back to dashboard/i })).toBeVisible()

  // should be weeks
  await expect(page.getByRole("heading", { name: /week \d+/i }).first()).toBeVisible()

  // should show resource section
  await expect(page.getByRole("heading", { name: /resources/i }).first()).toBeVisible()
})