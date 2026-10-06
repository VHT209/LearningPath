import { test, expect } from "@playwright/test"

// test for creating a path
// makes sure that the user can login then create a path where the ai will actually generate smt

test("user can create a new learning path", async ({ page }) => {

  // log in
  await page.goto("/")
  await page.getByRole("button", { name: "Login" }).first().click()
  await page.getByLabel("Email").fill("davidaltaccount1234@gmail.com")
  await page.getByLabel("Password").fill("12345678")
  await page.getByRole("button", { name: "Login" }).last().click()
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })

  // make sure that its a unique topic, 
  const uniqueTopic = `PW Test ${Date.now()}`

  // open the creation for learnin gpath
  await page.getByRole("button", { name: /create learning path/i }).click()

  // fill in topic info
  await page.getByLabel("Topic").fill(uniqueTopic)

  // shadcn uses a select dropdown, have to deal with it thru click trigger then click option
  await page.getByLabel("Level").click()
  await page.getByRole("option", { name: "Beginner" }).click()

  // set weeks low just so that it doesnt use much
  await page.getByLabel("Number of Weeks").fill("2")

  // submit learning path stuff
  await page.getByRole("button", { name: "Create Learning Path" }).last().click()

  // wait for success message, takes like 6-7 seconds to load 
  await expect(page.getByText("Learning path created!")).toBeVisible({ timeout: 45000 })

  // go to dashboard and make sure card is there 
  await expect(page.getByRole("heading", { name: uniqueTopic })).toBeVisible({ timeout: 5000 })
})