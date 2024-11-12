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
   * Conditionally registers a test case based on the provided condition.
   * If the condition evaluates to `false`, `null`, or `undefined`, the test case is skipped.
   *
   * @param {boolean | (() => boolean | Promise<boolean> | null | undefined)} condition -
   *   A boolean value or a function that returns a boolean (or a Promise that resolves to a boolean).
   *   If `false`, `null`, or `undefined`, the test case is skipped.
   * @param {string} description - The description of the test case.
   * @param {TestFunction} fn - The test function to execute if the condition is `true`.
   * @param {Partial<Options>} [options] - Optional settings for the test, like timeout or skip.
   *
   * @example
   * // Basic usage with a boolean condition
   * itIf(true, 'should run this test', () => {
   *   // Test logic
   * });
   *
   * // Using a function condition
   * itIf(() => someDynamicCondition(), 'should run if the condition is true', async () => {
   *   // Test logic
   * });
   *
   * // Using an asynchronous condition
   * itIf(async () => await someAsyncCheck(), 'should run if async check passes', () => {
   *   // Test logic
   * });
   *
   * @since v1.0.0
   */
  function itIf(
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
  function it(description: string, fn: TestFunction, options?: Options): void;

  /**
   * Marks a test case to expect success when no error is thrown, and to be marked as "soft-failed" if an error is thrown during execution.
   *
   * @param {string} description - The description of the test case with expected soft-failure handling.
   * @param {TestFunction} fn - The test function expected to pass or be marked as soft-failed if an error occurs.
   * @param {Options} [options] - Optional configuration for the test (timeout, skipped).
   *
   * @example
   * fail('should handle failure scenario gracefully', () => {
   *   // Test logic that is expected to pass or be marked as soft-failed if it throws an error
   * });
   *
   *
   * @since v1.0.0
   */
  function fail(description: string, fn: TestFunction, options?: Options): void;

  /**
   * Executes the provided function with a timeout and adds it to the test queue.
   *
   * @param {number} [timeout=0] - The timeout duration in milliseconds for the test function. Defaults to 0 (no timeout).
   * @param {string} description - A description of the test to be logged or reported.
   * @param {TestFunction} fn - The test function to be executed with the specified timeout.
   * @param {Partial<Options>} [options] - Optional configuration for the test (e.g., retry behavior, custom settings).
   *
   * @example
   * // Example usage:
   * timeout(500, 'Test login functionality', async () => {
   *   const result = await loginUser('username', 'password');
   * });
   * @since v1.0.0
   */
  function timeout(
    timeout: number,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Adds a "to-do" test (a test that is not yet implemented) to the test queue.
   *
   * @param {string} description - A description of the to-do test.
   * @param {Partial<Options>} [options] - Optional configuration for the to-do test (e.g., skipping the test or adding notes).
   *
   *  @example
   * // Example usage:
   * todo('Test dark mode functionality', { skip: true });
   *
   * @since v1.0.0
   */
  function todo(description: string, options?: Partial<Options>): void;

  /**
   * Retries the provided function a specified number of times in case of failure.
   *
   * @param {number} retry - The number of retry attempts.
   * @param {string} description - A description of the retry operation for logging or reporting purposes.
   * @param {TestFunction} fn - The function to be executed, which will be retried if it fails.
   * @param {Partial<Options>} [options] - Optional configuration for the retry behavior (e.g., delay between retries).
   *
   * @example
   * // Example usage
   * retry(3, 'Test login functionality with retries', async () => {
   *   const result = await loginUser('username', 'wrong_password');
   *   
   * });
   * @since v1.0.0
   */
  function retry(
    retry: number,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
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
  function only(description: string, fn: TestFunction, options?: Options): void;

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
  function skip(description: string, fn: TestFunction, options?: Options): void;

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
  function beforeAll(fn: HookFunction, options?: Options): void;

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
  function beforeEach(fn: HookFunction, options?: Options): void;

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
    options?: Options,
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
