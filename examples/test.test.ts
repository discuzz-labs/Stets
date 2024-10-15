import { describe, it, beforeAll, beforeEach, run } from "../dist/index";

// Define the test suites, tests, and hooks
describe("root 1", () => {
  describe("child 1.1", () => {

  })
})

describe("root 2", () => {
  describe("child 2.1", () => {
    describe("child 2.1.1", () => {

    })
  })
})

run()