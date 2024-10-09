import { Suite } from "../src/index"

const suite = new Suite("Test example")

suite.it("schould pass", () => {
  
})

suite.afterAll(() => {
  throw new Error("failed")
})

export default suite; // super important; Will impelment later a way to see if it is provided or not;