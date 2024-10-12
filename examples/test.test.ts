import { Suite } from "../dist/index";

const suite = new Suite("My Test Suite");

suite
  .beforeAll(async (suite) => {
    console.log("Running 'beforeAll' hook");
  })
  .afterAll(async (suite) => {
    console.log("Running 'afterAll' hook");
  })
  .beforeEach(async (suite, metadata) => {
    console.log(`Running 'beforeEach' hook for test #${metadata.index}`);
  })
  .afterEach(async (suite, metadata) => {
    console.log(`Running 'afterEach' hook for test #${metadata.index}`);
  });

// Test 1 - normal test
suite.it("Test 1", async (suite, metadata, update) => {
  console.log("Running Test 1");
  console.log(metadata);
}, { name: "T1", timeout: 0 }); // No timeout for Test 1

// Test 2 - depends on Test 1
suite.it("Test 2 (depends on T1)", async (suite, metadata) => {
  console.log("Running Test 2");
}, { name: "T2", dependsOn: "T1" });

// Test 3 - ignored test
suite.it("Test 3 (ignored)", async (suite, metadata) => {
  console.log("Running Test 3");
}, { name: "T3", ignore: true });

// Test 4 - simple test without timeout
suite.it("Test 4 ", async (suite, metadata) => {
  console.log("Running Test 4");
}, { name: "T4" });

// Test 5 - test with timeout
suite.it("Test 5 (timeout)", async (suite, metadata) => {
  console.log("Running Test 5");

  // Simulating a long-running operation (exceeding timeout)
  await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 seconds delay
}, { name: "T5", timeout: 1000 , retry: 2}); // Set timeout to 1 second

export default suite;
