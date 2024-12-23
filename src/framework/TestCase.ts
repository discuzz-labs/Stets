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
export type Status = "passed" | "failed" | "softfailed" | "skipped" | "todo";
export type TestCaseStatus = "passed" | "failed" | "pending" | "empty";
export type HookTypes = "afterAll" | "afterEach" | "beforeAll" | "beforeEach";

export interface Test {
  description: string;
  fn: TestFunction;
  options: Options;
}

export interface Hook {
  description: HookTypes;
  fn: HookFunction;
  options: Options;
}

export type TestResult = {
  description: string;
  status: Status;
  retries: number;
  duration: number;
  error?: ErrorMetadata;
  bench: BenchmarkMetrics | null;
};

export type HookResult = {
  description: HookTypes;
  status: Status;
  retries: number;
  duration: number;
  error?: ErrorMetadata;
  bench: null;
};

export interface Stats {
  total: number;
  skipped: number;
  passed: number;
  failed: number;
  softfailed: number;
  todo: number;
}

export interface TestReport {
  stats: Stats;
  description: string;
  status: TestCaseStatus;
  tests: TestResult[];
  hooks: HookResult[];
}

const DEFAULT_OPTIONS: Options = {
  timeout: 300_000,
  skip: false,
  softfail: false,
  if: true,
  retry: 0,
  sequencial: false,
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

/**
 * Interface representing configuration options for a test case.
 */
export interface Options {
  /**
   * The maximum time (in milliseconds) a test is allowed to run before timing out.
   * @type {number}
   * @example 5000 // 5 seconds timeout
   */
  timeout: number;

  /**
   * Indicates whether the test should be skipped.
   * @type {boolean}
   * @example true // Test will be skipped
   */
  skip: boolean;

  /**
   * A condition to determine whether the test should run.
   * Can be a boolean, a function returning a boolean, or a promise resolving to a boolean.
   * @type {boolean | undefined | null | (() => boolean | Promise<boolean> | null | undefined)}
   * @example
   * true // Test will run
   * () => environment === 'production' // Conditional test execution
   */
  if:
    | boolean
    | undefined
    | null
    | (() => boolean | Promise<boolean> | null | undefined);

  /**
   * The number of times the test should be retried upon failure.
   * @type {number}
   * @example 3 // Retry the test 3 times
   */
  retry: number;

  /**
   * Indicates whether the test should allow soft failures without halting the test suite.
   * @type {boolean}
   * @example true // Test can fail without breaking the suite
   */
  softfail: boolean;

  /**
   * Indicates whether the test should be run sequentially.
   * @type {boolean}
   * @example true // Test will run in sequence with others
   */
  sequencial: boolean;

  /**
   * Indicates whether the test is a benchmark test.
   * @type {boolean}
   * @example true // Marks the test as a benchmark
   */
  bench: boolean;

  /**
   * Indicates whether the test is marked as a 'to-do' item.
   * @type {boolean}
   * @example true // Test is marked as a to-do
   */
  todo: boolean;

  /**
   * The number of iterations the test should run.
   * @type {number | undefined}
   * @example 100 // Run the test 100 times
   */
  iterations: number;

  /**
   * The number of warmup iterations before the actual test begins.
   * @type {number | undefined}
   * @example 10 // Perform 10 warmup iterations before testing
   */
  warmup: number;

  /**
   * The confidence level for statistical calculations (between 0 and 1).
   * Used to calculate confidence intervals for the benchmark results.
   * Higher values mean more confidence but wider intervals.
   * @type {number | undefined}
   * @default 0.95
   * @example 0.99 // Use 99% confidence level for more rigorous results
   * @example 0.90 // Use 90% confidence level for narrower intervals
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

// Top Level API
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
    if (options?.sequencial)
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
    if (options?.sequencial)
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
    if (options?.sequencial)
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
    if (options?.sequencial)
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
    if (options?.sequencial)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  public fail(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, softfail: true });
    if (options?.sequencial)
      this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  // Define an 'only' test (executes only these tests)
  public only(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    if (options?.sequencial)
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
    if (options?.sequencial)
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
