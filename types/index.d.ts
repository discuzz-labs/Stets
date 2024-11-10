/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.

 */

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface Options {
  timeout?: number;
  skip?: boolean;
}

export interface Test {
  description: string;
  fn: TestFunction;
  options: Options;
}

export interface Hook {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  fn: HookFunction;
  options: Options;
}

export type TestResult = {
  description: string;
  status: "passed" | "failed" | "skipped";
  error?: { message: string; stack: string };
};

export type HookResult = {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  status: "passed" | "failed" | "skipped";
  error?: { message: string; stack: string };
};

export type TestReport = {
  stats: {
    total: number;
    skipped: number;
    passed: number;
    failed: number;
  };
  description: string;
  passed: boolean;
  tests: TestResult[];
  hooks: HookResult[];
};

declare global {
  /**
   * Registers an individual test case.
   *
   * @param {string} description - The description of the test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {Options} [options] - Optional options for the test (timeout, skipped).
   * @example
   * it('should test something', () => {
   *   // Test logic
   * }, { timeout: 1000 });
   */
  function it(
    description: string, 
    fn: TestFunction, 
    options?: Options
  ): void;

  /**
   * Registers a test case to be executed exclusively.
   *
   * @param {string} description - The description of the exclusive test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {Options} [options] - Optional options for the test (timeout, skipped).
   * @example
   * only('should only run this test', () => {
   *   // Test logic
   * }, { timeout: 1000 });
   */
  function only(
    description: string, 
    fn: TestFunction, 
    options?: Options
  ): void;

  /**
   * Registers a test case to be skipped.
   *
   * @param {string} description - The description of the skipped test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {Options} [options] - Optional options for the test (timeout, skipped).
   * @example
   * skip('should skip this test', () => {
   *   // Test logic
   * });
   */
  function skip(
    description: string, 
    fn: TestFunction, 
    options?: Options
  ): void;

  /**
   * Registers a beforeAll hook to run once before all tests in the suite.
   *
   * @param {HookFunction} fn - The hook function to execute.
   * @param {Options} [options] - Optional options for the hook (timeout).
   * @example
   * beforeAll(() => {
   *   // Setup logic
   * });
   */
  function beforeAll(
    fn: HookFunction, 
    options?: Options
  ): void;

  /**
   * Registers a beforeEach hook to run before each test in the suite.
   *
   * @param {HookFunction} fn - The hook function to execute.
   * @param {Options} [options] - Optional options for the hook (timeout).
   * @example
   * beforeEach(() => {
   *   // Reset state logic
   * });
   */
  function beforeEach(
    fn: HookFunction, 
    options?: Options
  ): void;

  /**
   * Executes a test for each set of data provided in the table.
   *
   * @param {Array<any[]>} table - An array of arrays, each containing arguments to pass to the test function.
   * @param {string} description - A formatted description of the test using printf-style placeholders.
   * @param {(...args: any[]) => void | Promise<void>} fn - The test function to execute for each set of arguments.
   * @param {Options} [options] - Optional options for the test (timeout).
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
    options?: Options
  ): void;

  /**
   * Runs the Suite and returns the Report.
   *
   * @returns {Promise<TestReport>} - The report of the test suite execution.
   * @example
   * run().then(report => console.log(report));
   */
  function run(): Promise<TestReport>;
}

export {};
