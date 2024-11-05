/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.

 */

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface Test {
  description: string;
  fn: TestFunction;
  timeout: number;
}

export interface Hook {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  fn: HookFunction;
  timeout: number;
}

export type TestResult = {
  description: string;
  status: "passed" | "failed";
  error?: { message: string; stack: string };
};

export type HookResult = {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  status: "passed" | "failed";
  error?: { message: string; stack: string };
};

export type SuiteReport = {
  passed: boolean;
  description: string;
  metrics: {
    passed: number;
    failed: number;
    skipped: number;
  };
  tests: Array<TestResult>;
  hooks: Array<HookResult>;
  children: SuiteReport[];
  error?: string;
};

declare global {
  /**
   * Registers a new describe block to group related tests.
   *
   * @param {string} description - The description of the describe block.
   * @param {() => void} callback - The function containing tests/hooks to register in this block.
   * @example
   * Describe('My Test Suite', () => {
   *   it('should pass this test', () => {
   *     // Test logic
   *   });
   * });
   */
  function Describe(description: string, callback: () => void): void;

  /**
   * Executes a suite of tests for each set of data provided in the table.
   *
   * @param {Array<any[]>} table - An array of arrays, each containing arguments for the test suite.
   * @param {string} description - A formatted description of the suite using printf-style placeholders.
   * @param {function} fn - The function that defines the suite for each set of arguments.
   * @example
   * Each([
   *   ['Case 1', 1, 1, 2],
   *   ['Case 2', 1, 2, 3],
   *   ['Case 3', 2, 1, 3],
   * ], '%s: add(%i, %i)', (caseName, a, b, expected) => {
   *   it('should return the correct sum', () => {
   *     expect(a + b).toBe(expected);
   *   });
   * });
   */
  function Each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void,
  ): void;

  /**
   * Skips a suite of tests with the specified description.
   *
   * @param {string} description - The name of the suite to be skipped.
   * @param {function} callback - The function containing the tests to be skipped.
   * @example
   * Skip('Skipped Test Suite', () => {
   *   it('should skip this test', () => {
   *     // Test logic
   *   });
   * });
   */
  function Skip(description: string, callback: () => void): void;

  /**
   * Marks a suite of tests with the specified description as exclusive.
   * Only suites marked with `Only` will be executed, and all other suites
   * will be ignored unless they are also marked as `Only`.
   *
   * @param {string} description - The name of the suite to be run exclusively.
   * @param {function} callback - The function containing the tests to be run exclusively.
   * @example
   * Only('Exclusive Test Suite', () => {
   *   it('should run this test exclusively', () => {
   *     // Test logic
   *   });
   * });
   */
  function Only(description: string, callback: () => void): void;

  /**
   * Registers an individual test case.
   *
   * @param {string} description - The description of the test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {number} [timeout] - Optional timeout for the test in milliseconds.
   * @example
   * it('should test something', () => {
   *   // Test logic
   * }, 1000);
   */
  function it(description: string, fn: TestFunction, timeout?: number): void;

  /**
   * Registers a test case to be executed exclusively.
   *
   * @param {string} description - The description of the exclusive test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {number} [timeout] - Optional timeout for the test in milliseconds.
   * @example
   * only('should only run this test', () => {
   *   // Test logic
   * }, 1000);
   */
  function only(description: string, fn: TestFunction, timeout?: number): void;

  /**
   * Registers a test case to be skipped.
   *
   * @param {string} description - The description of the skipped test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {number} [timeout] - Optional timeout for the test in milliseconds.
   * @example
   * skip('should skip this test', () => {
   *   // Test logic
   * });
   */
  function skip(description: string, fn: TestFunction, timeout?: number): void;

  /**
   * Registers a beforeAll hook to run once before all tests in the suite.
   *
   * @param {HookFunction} fn - The hook function to execute.
   * @param {number} [timeout] - Optional timeout for the hook in milliseconds.
   * @example
   * beforeAll(() => {
   *   // Setup logic
   * });
   */
  function beforeAll(fn: HookFunction, timeout?: number): void;

  /**
   * Registers a beforeEach hook to run before each test in the suite.
   *
   * @param {HookFunction} fn - The hook function to execute.
   * @param {number} [timeout] - Optional timeout for the hook in milliseconds.
   * @example
   * beforeEach(() => {
   *   // Reset state logic
   * });
   */
  function beforeEach(fn: HookFunction, timeout?: number): void;

  /**
   * Executes a test for each set of data provided in the table.
   *
   * @param {Array<any[]>} table - An array of arrays, each containing arguments to pass to the test function.
   * @param {string} description - A formatted description of the test using printf-style placeholders.
   * @param {(...args: any[]) => void | Promise<void>} fn - The test function to execute for each set of arguments.
   * @param {number} [timeout=0] - Optional timeout for the test in milliseconds.
   * @example
   * each([
   *   [1, 1, 2],
   *   [1, 2, 3],
   *   [2, 1, 3],
   * ], '.add(%i, %i)', (a, b, expected) => {
   *   expect(a + b).toBe(expected);
   * });
   */
  function each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    timeout?: number,
  ): void;

  /**
   * Runs the Suite and returns the Report.
   *
   * @returns {Promise<SuiteReport>} - The report of the test suite execution.
   * @example
   * run().then(report => console.log(report));
   */
  function run(): Promise<SuiteReport>;
}

export declare class Suite {
  /**
   * Creates a new Suite.
   *
   * @param {string} [description] - The description of the Suite block.
   * @param {Suite | null} [parent] - Optional parent Suite to nest this Suite within.
   * @example
   * const suite = new Suite('My Test Suite');
   */
  constructor(description?: string, parent?: Suite | null);

  /**
   * Registers a new describe block to group related tests.
   *
   * @param {string} description - The description of the describe block.
   * @param {() => void} callback - The function containing tests/hooks to register in this block.
   * @example
   * Describe('My Test Suite', () => {
   *   it('should pass this test', () => {
   *     // Test logic
   *   });
   * });
   */
  Describe(description: string, callback: () => void): void;

  /**
   * Executes a suite of tests for each set of data provided in the table.
   *
   * @param {Array<any[]>} table - An array of arrays, each containing arguments for the test suite.
   * @param {string} description - A formatted description of the suite using printf-style placeholders.
   * @param {function} fn - The function that defines the suite for each set of arguments.
   * @example
   * Each([
   *   ['Case 1', 1, 1, 2],
   *   ['Case 2', 1, 2, 3],
   *   ['Case 3', 2, 1, 3],
   * ], '%s: add(%i, %i)', (caseName, a, b, expected) => {
   *   it('should return the correct sum', () => {
   *     expect(a + b).toBe(expected);
   *   });
   * });
   */
  Each(table: any[], description: string, fn: (...args: any[]) => void): void;

  /**
   * Skips a suite of tests with the specified description.
   *
   * @param {string} description - The name of the suite to be skipped.
   * @param {function} callback - The function containing the tests to be skipped.
   * @example
   * Skip('Skipped Test Suite', () => {
   *   it('should skip this test', () => {
   *     // Test logic
   *   });
   * });
   */
  Skip(description: string, callback: () => void): void;

  /**
   * Marks a suite of tests with the specified description as exclusive.
   * Only suites marked with `Only` will be executed, and all other suites
   * will be ignored unless they are also marked as `Only`.
   *
   * @param {string} description - The name of the suite to be run exclusively.
   * @param {function} callback - The function containing the tests to be run exclusively.
   * @example
   * Only('Exclusive Test Suite', () => {
   *   it('should run this test exclusively', () => {
   *     // Test logic
   *   });
   * });
   */
  Only(description: string, callback: () => void): void;

  /**
   * Registers an individual test case.
   *
   * @param {string} description - The description of the test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {number} [timeout] - Optional timeout for the test in milliseconds.
   * @example
   * it('should test something', () => {
   *   // Test logic
   * }, 1000);
   */
  it(description: string, fn: TestFunction, timeout?: number): void;

  /**
   * Registers a test case to be executed exclusively.
   *
   * @param {string} description - The description of the exclusive test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {number} [timeout] - Optional timeout for the test in milliseconds.
   * @example
   * only('should only run this test', () => {
   *   // Test logic
   * }, 1000);
   */
  only(description: string, fn: TestFunction, timeout?: number): void;

  /**
   * Registers a test case to be skipped.
   *
   * @param {string} description - The description of the skipped test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {number} [timeout] - Optional timeout for the test in milliseconds.
   * @example
   * skip('should skip this test', () => {
   *   // Test logic
   * });
   */
  skip(description: string, fn: TestFunction, timeout?: number): void;

  /**
   * Registers a beforeAll hook to run once before all tests in the suite.
   *
   * @param {HookFunction} fn - The hook function to execute.
   * @param {number} [timeout] - Optional timeout for the hook in milliseconds.
   * @example
   * beforeAll(() => {
   *   // Setup logic
   * });
   */
  beforeAll(fn: HookFunction, timeout?: number): void;

  /**
   * Registers a beforeEach hook to run before each test in the suite.
   *
   * @param {HookFunction} fn - The hook function to execute.
   * @param {number} [timeout] - Optional timeout for the hook in milliseconds.
   * @example
   * beforeEach(() => {
   *   // Reset state logic
   * });
   */
  beforeEach(fn: HookFunction, timeout?: number): void;

  /**
   * Executes a test for each set of data provided in the table.
   *
   * @param {Array<any[]>} table - An array of arrays, each containing arguments to pass to the test function.
   * @param {string} description - A formatted description of the test using printf-style placeholders.
   * @param {(...args: any[]) => void | Promise<void>} fn - The test function to execute for each set of arguments.
   * @param {number} [timeout=0] - Optional timeout for the test in milliseconds.
   * @example
   * each([
   *   [1, 1, 2],
   *   [1, 2, 3],
   *   [2, 1, 3],
   * ], '.add(%i, %i)', (a, b, expected) => {
   *   expect(a + b).toBe(expected);
   * });
   */
  each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    timeout?: number,
  ): void;

  /**
   * Runs the Suite and returns the Report.
   *
   * @returns {Promise<SuiteReport>} - The report of the test suite execution.
   * @example
   * run().then(report => console.log(report));
   */
  run(): Promise<SuiteReport>;
}

export default Suite;
