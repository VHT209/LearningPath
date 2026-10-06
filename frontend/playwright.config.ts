import { defineConfig } from "@playwright/test"

export default defineConfig({

  // test files gonna be here
  testDir: "./e2e",

  // time per test, added more cause ai has to generate stuff

  timeout: 60_000, 
  // run tests
  fullyParallel: false,
  workers: 1,

  
  use: {
    baseURL: "http://localhost:3000",

    // traces meant for debugging
    trace: "on-first-retry",
  },

  // have to have both front and back on and working 
})