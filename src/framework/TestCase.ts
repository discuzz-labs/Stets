/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { format } from "util";
import RunTime from "./RunTime.js";
import { ErrorMetadata } from "../core/ErrorInspect.js";
import { BenchmarkMetrics } from "../core/Bench.js";

export type TestFunction = () => void | Promise<void>;

export type HookFunction = () => void | Promise<void>;

export type Status = 
  /**
   * Test status types: passed, failed, softfailed, skipped, or todo
   * @type {'passed' | 'failed' | 'softfailed' | 'skipped' | 'todo'}
   */
  "passed" | "failed" | "softfailed" | "skipped" | "todo";

export type TestCaseStatus = 
  /**
   * Test case status types: passed, failed, pending, or empty
   * @type {'passed' | 'failed' | 'pending' | 'empty'}
   */
  "passed" | "failed" | "pending" | "empty";

export type HookTypes = 
  /**
   * Hook types for setup and teardown: afterAll, afterEach, beforeAll, or beforeEach
   * @type {'afterAll' | 'afterEach' | 'beforeAll' | 'beforeEach'}
   */
  "afterAll" | "afterEach" | "beforeAll" | "beforeEach";

export interface Test {
  /**
   * Description of the test
   * @type {string}
   */
  description: string;

  /**
   * The function to execute for the test
   * @type {TestFunction}
   */
  fn: TestFunction;

  /**
   * Test options
   * @type {Options}
   */
  options: Options;
}

export interface Hook {
  /**
   * Description of the hook
   * @type {HookTypes}
   */
  description: HookTypes;

  /**
   * The function to execute for the hook
   * @type {HookFunction}
   */
  fn: HookFunction;

  /**
   * Hook options
   * @type {Options}
   */
  options: Options;
}

export type TestResult = {
  /**
   * Description of the test result
   * @type {string}
   */
  description: string;

  /**
   * The status of the test result
   * @type {Status}
   */
  status: Status;

  /**
   * Number of retries for the test
   * @type {number}
   */
  retries: number;

  /**
   * Duration of the test in milliseconds
   * @type {number}
   */
  duration: number;

  /**
   * Error metadata if the test failed
   * @type {ErrorMetadata | undefined}
   */
  error?: ErrorMetadata;

  /**
   * Benchmark metrics for the test
   * @type {BenchmarkMetrics | null}
   */
  bench: BenchmarkMetrics | null;
};

export type HookResult = {
  /**
   * Description of the hook result
   * @type {HookTypes}
   */
  description: HookTypes;

  /**
   * The status of the hook result
   * @type {Status}
   */
  status: Status;

  /**
   * Number of retries for the hook
   * @type {number}
   */
  retries: number;

  /**
   * Duration of the hook in milliseconds
   * @type {number}
   */
  duration: number;

  /**
   * Error metadata if the hook failed
   * @type {ErrorMetadata | undefined}
   */
  error?: ErrorMetadata;

  /**
   * Benchmark metrics for the hook (always null)
   * @type {null}
   */
  bench: null;
};

export interface Stats {
  /**
   * Total number of tests
   * @type {number}
   */
  total: number;

  /**
   * Number of skipped tests
   * @type {number}
   */
  skipped: number;

  /**
   * Number of passed tests
   * @type {number}
   */
  passed: number;

  /**
   * Number of failed tests
   * @type {number}
   */
  failed: number;

  /**
   * Number of softfailed tests
   * @type {number}
   */
  softfailed: number;

  /**
   * Number of tests marked as todo
   * @type {number}
   */
  todo: number;
}

export interface TestReport {
  /**
   * Test statistics
   * @type {Stats}
   */
  stats: Stats;

  /**
   * Description of the test report
   * @type {string}
   */
  description: string;

  /**
   * Overall status of the test case
   * @type {TestCaseStatus}
   */
  status: TestCaseStatus;

  /**
   * List of test results
   * @type {TestResult[]}
   */
  tests: TestResult[];

  /**
   * List of hook results
   * @type {HookResult[]}
   */
  hooks: HookResult[];
}

/**
 * Interface representing configuration options for a test case
 */
export interface Options {
  /**
   * The maximum time (in milliseconds) a test is allowed to run before timing out
   * 
   * @type {number}
   * @default 300000
   */
  timeout: number;

  /**
   * Indicates whether the test should be skipped
   * 
   * @type {boolean}
   * @default false
   */
  skip: boolean;

  /**
   * A condition to determine whether the test should run
   * Can be a boolean, a function returning a boolean, or a promise resolving to a boolean
   * 
   * @type {boolean | undefined | null | (() => boolean | Promise<boolean> | null | undefined)}
   * @default true
   */
  if:
    | boolean
    | undefined
    | null
    | (() => boolean | Promise<boolean> | null | undefined);

  /**
   * The number of times the test should be retried upon failure
   * 
   * @type {number}
   * @default 0
   */
  retry: number;

  /**
   * Indicates whether the test should allow soft failures without halting the test suite
   * 
   * @type {boolean}
   * @default false
   */
  softfail: boolean;

  /**
   * Indicates whether the test should be run sequentially
   * 
   * @type {boolean}
   * @default false
   */
  sequential: boolean;

  /**
   * Indicates whether the test is a benchmark test
   * 
   * @type {boolean}
   * @default false
   */
  bench: boolean;

  /**
   * Indicates whether the test is marked as a 'to-do' item
   * 
   * @type {boolean}
   * @default false
   */
  todo: boolean;

  /**
   * The number of iterations the test should run
   * 
   * @type {number | undefined}
   * @default 1000
   */
  iterations: number;

  /**
   * The number of warmup iterations before the actual test begins
   * 
   * @type {number | undefined}
   * @default 50
   */
  warmup: number;

  /**
   * The confidence level for statistical calculations (between 0 and 1)
   * Used to calculate confidence intervals for the benchmark results
   * Higher values mean more confidence but wider intervals
   * 
   * @type {number | undefined}
   * @default 0.95
   */
  confidence: number;
}

/**
 * Interface representing a test case and its associated methods and properties.
 */
export interface TestCase {
  /**
   * The description of the test case.
   * @example 'User login tests'
   */
  description: string;

  /**
   * Updates the description of the test case.
   * @param description - The new description for the test case.
   * @example testCase.should('Updated description');
   */
  should(description: string): void;

  /**
   * Defines a benchmark test.
   * @param description - The description of the test.
   * @param fn - The function to benchmark.
   * @param options - Additional test options.
   * @example testCase.bench('Measure performance', () => doWork());
   */
  bench(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a parameterized test for each entry in the provided table.
   * @param table - An array of test data.
   * @param description - The description template.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example
   * testCase.each([[1, 2], [3, 4]], 'adds %d and %d', (a, b) => expect(a + b).toBeGreaterThan(0));
   */
  each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a standard test.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.it('should login successfully', () => login());
   */
  it(description: string, fn: TestFunction, options?: Partial<Options>): void;

  /**
   * Defines a test to run in sequence.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.sequence('processes data sequentially', () => processData());
   */
  sequence(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a test with retry logic.
   * @param retry - The number of retries.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.retry(3, 'retryable test', () => flakyTest());
   */
  retry(
    retry: number,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a test with a timeout.
   * @param timeout - The timeout in milliseconds.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.timeout(5000, 'should finish within 5 seconds', () => quickTest());
   */
  timeout(
    timeout: number,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Adds a todo test.
   * @param description - The description of the test.
   * @param options - Additional test options.
   * @example testCase.todo('Implement this later');
   */
  todo(description: string, options?: Partial<Options>): void;

  /**
   * Conditionally runs a test if the condition is met.
   * @param condition - A boolean or function returning a boolean.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.itIf(true, 'conditionally run this test', () => doTest());
   */
  itIf(
    condition:
      | boolean
      | undefined
      | null
      | (() => boolean | Promise<boolean> | null | undefined),
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Marks a test to allow soft failures.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.fail('non-critical test', () => flakyTest());
   */
  fail(description: string, fn: TestFunction, options?: Partial<Options>): void;

  /**
   * Marks a test to run exclusively.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.only('critical test', () => runCriticalTest());
   */
  only(description: string, fn: TestFunction, options?: Partial<Options>): void;

  /**
   * Skips a test.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.skip('skipped test', () => doNotRun());
   */
  skip(description: string, fn: TestFunction, options?: Partial<Options>): void;

  /**
   * Adds a 'beforeAll' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   * @example testCase.beforeAll(() => setup());
   */
  beforeAll(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Adds a 'beforeEach' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   * @example testCase.beforeEach(() => setupEach());
   */
  beforeEach(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Adds an 'afterAll' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   * @example testCase.afterAll(() => teardown());
   */
  afterAll(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Adds an 'afterEach' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   * @example testCase.afterEach(() => cleanupEach());
   */
  afterEach(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Runs the test case and returns a test report.
   * @returns {Promise<TestReport>} The test report after execution.
   * @example const report = await testCase.run();
   */
  run(): Promise<TestReport>;
}


const DEFAULT_OPTIONS: Options = {
  timeout: 300_000,
  skip: false,
  softfail: false,
  if: true,
  retry: 0,
  sequential: false,
  bench: false,
  todo: false,
  iterations: 1000,
  warmup: 50,
  confidence: 0.95,
};

// Merge the provided options with the default options
function mergeOptions(options?: Partial<Options>): Options {
  return { ...DEFAULT_OPTIONS, ...options };
}

export class TestCase {
  public description: string;
  public tests: Test[];
  public sequenceTests: Test[];
  public sequenceOnlyTests: Test[];
  public onlyTests: Test[];
  public hooks: {
    beforeAll?: Hook;
    beforeEach?: Hook;
    afterAll?: Hook;
    afterEach?: Hook;
  };

  constructor(description: string) {
    this.description = description;
    this.tests = [];
    this.onlyTests = [];
    this.sequenceTests = [];
    this.sequenceOnlyTests = [];
    this.hooks = {};
  }

  public should(description: string) {
    this.description = description;
  }

  public bench(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ) {
    const mergedOptions = mergeOptions({ ...options, bench: true });
    if (options?.sequential)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  public each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions(options);
    table.forEach((data) => {
      const formattedDescription = format(description, ...data);
      this.it(formattedDescription, () => fn(...data), mergedOptions);
    });
  }

  // Define a test
  public it(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    if (options?.sequential)
      this.sequenceTests.push({
        description,
        fn,
        options: mergeOptions(options),
      });
    else this.tests.push({ description, fn, options: mergeOptions(options) });
  }

  public sequence(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    this.sequenceTests.push({
      description,
      fn,
      options: mergeOptions(options),
    });
  }

  public retry(
    retry: number = 0,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, retry });
    if (options?.sequential)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  public timeout(
    timeout: number = 0,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, timeout });
    if (options?.sequential)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  public todo(description: string, options?: Partial<Options>): void {
    const mergedOptions = mergeOptions({ ...options, todo: true });
    this.tests.push({
      description,
      fn: () => {},
      options: mergedOptions,
    });
  }

  public itIf(
    condition:
      | boolean
      | undefined
      | null
      | (() => boolean | Promise<boolean> | null | undefined),
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, if: condition });
    if (options?.sequential)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  public fail(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, softfail: true });
    if (options?.sequential)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  // Define an 'only' test (executes only these tests)
  public only(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    if (options?.sequential)
      this.sequenceOnlyTests.push({
        description,
        fn,
        options: mergeOptions(options),
      });
    else
      this.onlyTests.push({ description, fn, options: mergeOptions(options) });
  }

  // Skip a test
  public skip(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, skip: true });
    if (options?.sequential)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  // Define 'beforeAll' hook
  public beforeAll(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.beforeAll = {
      description: "beforeAll",
      fn,
      options: mergeOptions(options),
    };
  }

  // Define 'beforeEach' hook
  public beforeEach(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.beforeEach = {
      description: "beforeEach",
      fn,
      options: mergeOptions(options),
    };
  }

  // Define 'afterAll' hook
  public afterAll(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.afterAll = {
      description: "afterAll",
      fn,
      options: mergeOptions(options),
    };
  }

  // Define 'afterEach' hook
  public afterEach(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.afterEach = {
      description: "afterEach",
      fn,
      options: mergeOptions(options),
    };
  }

  async run(): Promise<TestReport> {
    return await new RunTime(this).run();
  }
}

export default TestCase;
