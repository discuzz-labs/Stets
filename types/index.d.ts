/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.

 */

import { TestReport, Options, TestFunction, HookFunction } from "./types";

declare global {
  /**
   * Sets a custom description for a test case.
   *
   * This function allows you to specify a custom name or description for a test case. 
   * It is useful for renaming the default test case description, making the tests more descriptive and readable.
   *
   * @param {string} description - A custom name or description for the test case.
   * 
   * @example
   * should('Testing Auth')
   * it('Login', () => {
   *     // Test logic
   *   });
   *
   * @since v1.0.0
   */
  function should(description: string): void;
  
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
   *
   * @since v1.0.0
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
   *
   * @since v1.0.0
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
   *
   * @since v1.0.0
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
   *
   * @since v1.0.0
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
   *
   * @since v1.0.0
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
   * 
   * @since v1.0.0
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
   *
   * @since v1.0.0
   */
  function run(): Promise<TestReport>;
}

export {};
