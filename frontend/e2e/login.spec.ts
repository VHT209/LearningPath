import { test, expect } from "@playwright/test"


// makes sure to test that the frontend will call back and will store the token of the user and also go to dashboard
test("user can log in and reach dashboard", async ({ page }) => {

  // start at home page
  await page.goto("/")

  // open log in dialog
  await page.getByRole("button", { name: "Login" }).first().click()

  // fill your info in 
  await page.getByLabel("Email").fill("davidaltaccount1234@gmail.com")
  await page.getByLabel("Password").fill("12345678")

  // submit info
  await page.getByRole("button", { name: "Login" }).last().click()

  // after login, should go to dashboard
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible()
})