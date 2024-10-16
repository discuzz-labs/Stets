import { describe, it, beforeAll, beforeEach, run } from "../dist/index";

// Define the test suites, tests, and hooks

describe("root 1", () => {
  it("test 1", () => {
    console.log("hello")
  })
  describe("child 1.1", () => {
    
  })
})

describe("root 2", () => {
  describe("child 2.1", () => {
    describe("child 2.1.1", () => {
      it("test 1", () => {
        throw new Error("test 1")
      })
    })
  })
})

run()