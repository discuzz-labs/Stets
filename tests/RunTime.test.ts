import proxyquire from "proxyquire";
import "veve";

should("Test RunTime");

// Mock Bench utility
const BenchMock = {
  run: async (fn) => {
    await fn();
    return { duration: 50, iterations: 100 };
  },
};

// Mock OS module to control CPU count
const osMock = {
  cpus: () => Array(4).fill({}), // Simulate 4 CPUs
};

// Create test functions with various behaviors
const successFn = async () => {};
const failFn = async () => { throw new Error("Test failure"); };
const slowFn = async () => new Promise(resolve => setTimeout(resolve, 100));
const timeoutFn = async () => new Promise(resolve => setTimeout(resolve, 6000));
const DEFAULT_OPTIONS: Options = {
  timeout: 0,
  skip: false,
  softfail: false,
  if: true,
  retry: 0,
  sequencial: false,
  bench: false,
  todo: false,
};
const mergeOptions = (customOptions) => ({ ...DEFAULT_OPTIONS, ...customOptions });

// Load RunTime with mocked dependencies
const { default: RunTime } = proxyquire("../dist/framework/RunTime.js", {
  "../core/Bench.js": { Bench: BenchMock },
  "os": osMock
})

it("should handle basic test execution and hooks", async function() {
  const testCase = {
    description: "Basic Test Suite",
    tests: [
      { description: "Success test", fn: successFn, options: mergeOptions({})},
      { description: "Skipped test", fn: successFn, options: mergeOptions({ skip: true}) }
    ],
    sequenceTests: [],
    onlyTests: [],
    sequenceOnlyTests: [],
    hooks: {
      beforeAll: { description: "Before All", fn: successFn, options:mergeOptions({})  },
      afterAll: { description: "After All", fn: successFn, options: mergeOptions({}) },
      beforeEach: { description: "Before Each", fn: successFn, options: mergeOptions({}) },
      afterEach: { description: "After Each", fn: successFn, options: mergeOptions({}) }
    }
  };

  const runtime = new RunTime(testCase);
  const report = await runtime.run();

  assert(report.description).toEqual("Basic Test Suite");
  assert(report.stats.total).toEqual(2);
  assert(report.stats.passed).toEqual(1);
  assert(report.stats.skipped).toEqual(1);
  assert(report.status).toEqual("passed");
  assert(report.hooks.length).toEqual(6);
  assert(report.tests.length).toEqual(2);
});

it("should handle test failures and retries", async function() {
  const testCase = {
    description: "Failure and Retry Suite",
    tests: [
      { 
        description: "Failing test with retry", 
        fn: failFn, 
        options: mergeOptions({ retry: 2 })
      },
      { 
        description: "Soft failing test", 
        fn: failFn, 
        options: mergeOptions({softfail: true})
      }
    ],
    sequenceTests: [],
    onlyTests: [],
    sequenceOnlyTests: [],
    hooks: {}
  };

  const runtime = new RunTime(testCase);
  const report = await runtime.run();

  assert(report.stats.failed).toEqual(1);
  assert(report.stats.softfailed).toEqual(1);
  assert(report.tests[0].retries).toEqual(2); // 2 retries
  assert(report.status).toEqual("failed");
});

it("should handle conditional tests", async function() {
  const testCase = {
    description: "Conditional Tests Suite",
    tests: [
      { 
        description: "Conditional true test", 
        fn: successFn, 
        options: mergeOptions({ if: true })
      },
      { 
        description: "Conditional false test", 
        fn: successFn, 
        options: mergeOptions({ if: false })
      },
      { 
        description: "Dynamic condition test", 
        fn: successFn, 
        options: mergeOptions({ if: async () => true })
      }
    ],
    sequenceTests: [],
    onlyTests: [],
    sequenceOnlyTests: [],
    hooks: {}
  };

  const runtime = new RunTime(testCase);
  const report = await runtime.run();

  assert(report.stats.passed).toEqual(2);
  assert(report.stats.skipped).toEqual(1);
});

it("should handle timeouts and benchmarking", async function() {
  const testCase = {
    description: "Timeout and Bench Suite",
    tests: [
      { 
        description: "Timeout test", 
        fn: timeoutFn, 
        options: mergeOptions({ timeout: 100 })
      },
      { 
        description: "Bench test", 
        fn: successFn, 
        options: mergeOptions({ bench: true })
      }
    ],
    sequenceTests: [],
    onlyTests: [],
    sequenceOnlyTests: [],
    hooks: {}
  };

  const runtime = new RunTime(testCase);
  const report = await runtime.run();

  assert(report.stats.failed).toEqual(1);
  assert(report.tests[0].error.message).toContain("exceeded 100 ms");
  assert(report.tests[1].status).toEqual("passed");
  assert(report.tests[1].bench).not.toBeNull()
  assert(report.tests[1].bench).toBeDefined();
});

it("should handle parallel and sequence execution", async function() {
  const testCase = {
    description: "Parallel and Sequence Suite",
    tests: [
      { description: "Parallel test 1", fn: slowFn, options: mergeOptions({}) },
      { description: "Parallel test 2", fn: slowFn, options: mergeOptions({}) }
    ],
    sequenceTests: [
      { description: "Sequence test 1", fn: slowFn, options: mergeOptions({}) },
      { description: "Sequence test 2", fn: slowFn, options: mergeOptions({}) }
    ],
    onlyTests: [],
    sequenceOnlyTests: [],
    hooks: {}
  };

  const runtime = new RunTime(testCase);
  const startTime = Date.now();
  const report = await runtime.run();
  const duration = Date.now() - startTime;

  assert(report.stats.passed).toEqual(4);
  // Parallel tests should run simultaneously, sequence tests one after another
  assert(duration).toBeGreaterThan(300); // At least 3 * 100ms (1 parallel batch + 2 sequence)
  assert(duration).toBeLessThan(500); // But less than 5 * 100ms
});

it("should handle only tests correctly", async function() {
  const testCase = {
    description: "Only Tests Suite",
    tests: [
      { description: "Regular test", fn: successFn, options: mergeOptions({}) }
    ],
    sequenceTests: [
      { description: "Regular sequence test", fn: successFn, options: mergeOptions({}) }
    ],
    onlyTests: [
      { description: "Only test", fn: successFn, options: mergeOptions({}) }
    ],
    sequenceOnlyTests: [
      { description: "Only sequence test", fn: successFn, options: mergeOptions({}) }
    ],
    hooks: {}
  };

  const runtime = new RunTime(testCase);
  const report = await runtime.run();

  assert(report.stats.passed).toEqual(2); // Only the "only" tests should run
  assert(report.stats.skipped).toEqual(2); // Regular tests should be skipped
  assert(report.tests.length).toEqual(4);
});

it("should handle todo tests", async function() {
  const testCase = {
    description: "Todo Tests Suite",
    tests: [
      { 
        description: "Todo test", 
        fn: successFn, 
        options: mergeOptions({todo: true})
      }
    ],
    sequenceTests: [],
    onlyTests: [],
    sequenceOnlyTests: [],
    hooks: {}
  };

  const runtime = new RunTime(testCase);
  const report = await runtime.run();

  assert(report.stats.todo).toEqual(1);
  assert(report.tests[0].status).toEqual("todo");
});

run();