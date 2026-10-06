import { test, expect } from "@playwright/test"


// proves user can log out, token is cleared from storage, and redirected home
test("user can log out and is redirected to home", async ({ page }) => {

  // first log in
  await page.goto("/")
  await page.getByRole("button", { name: "Login" }).first().click()
  await page.getByLabel("Email").fill("davidaltaccount1234@gmail.com")
  await page.getByLabel("Password").fill("12345678")
  await page.getByRole("button", { name: "Login" }).last().click()

  // wait for dashboard to load
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })

  // verify token was actually saved before logout
  const tokenBefore = await page.evaluate(() => localStorage.getItem("access_token"))
  expect(tokenBefore).not.toBeNull()

  // click logout button in header
  await page.getByRole("button", { name: /log out/i }).click()

  // should go to homepage after logging out 
  await expect(page).toHaveURL("http://localhost:3000/", { timeout: 10000 })

  // make sure that the TOKEN is gone after logging out, should not stay 
  const tokenAfter = await page.evaluate(() => localStorage.getItem("access_token"))
  expect(tokenAfter).toBeNull()
})