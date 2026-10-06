// put 0 in the name name just so it can run first in the test 

import { test, expect } from "@playwright/test"

// uses a fixed email so login uses same email
// signup brings you straight to deashboard
// exists if on db already
test("test user can sign up or already exists", async ({ page }) => {

  // start at home page
  await page.goto("/")

  // open signup
  await page.getByRole("button", { name: "Sign Up" }).first().click()

  // fill in signup info
  await page.getByLabel("Email").fill("davidaltaccount1234@gmail.com")
  await page.getByLabel("Username").fill("playtest")
  await page.getByLabel("Password", { exact: true }).fill("12345678")
  await page.getByLabel("Confirm Password").fill("12345678")

  // submit
  await page.getByRole("button", { name: "Sign Up" }).last().click()

  // wait for signup success or fail
  await page.waitForTimeout(3000)

  // signup works so you go to dashboard automatically
  const onDashboard = page.url().includes("/dashboard")

  // if already exists, stay at home and say registered already 
  const errorToast = page.getByText(/registration failed|already|exist|registered|duplicate/i).first()
  const errorVisible = await errorToast.isVisible().catch(() => false)

  // either outcome means the user is in the DB now
  expect(onDashboard || errorVisible).toBe(true)
})