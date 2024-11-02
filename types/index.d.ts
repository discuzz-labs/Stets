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
  only?: boolean;
}

export interface Hook {
  description: "beforeAll" | "beforeEach";
  fn: HookFunction;
  timeout: number;
}

export type TestResult = {
  description: string;
  status: "passed" | "failed";
  error?: { message: string; stack: string };
};

export type HookResult = {
  description: "beforeAll" | "beforeEach";
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
   * describe('My Test Suite', () => {
   *   it('should pass this test', () => {
   *     // Test logic
   *   });
   * });
   */
  function describe(description: string, callback: () => void): void;

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
   * suite.describe('Inner Suite', () => {
   *   suite.it('should pass this test', () => {
   *     // Test logic
   *   });
   * });
   */
  describe(description: string, callback: () => void): void;

  /**
   * Registers an individual test case.
   * 
   * @param {string} description - The description of the test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {number} [timeout] - Optional timeout for the test in milliseconds.
   * @example
   * suite.it('should test something', () => {
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
   * suite.only('should only run this test', () => {
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
   * suite.skip('should skip this test', () => {
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
   * suite.beforeAll(() => {
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
   * suite.beforeEach(() => {
   *   // Reset state logic
   * });
   */
  beforeEach(fn: HookFunction, timeout?: number): void;

  /**
   * Runs the Suite and returns the Report.
   * 
   * @returns {Promise<SuiteReport>} - The report of the test suite execution.
   * @example
   * suite.run().then(report => console.log(report));
   */
  run(): Promise<SuiteReport>;
}

export default Suite;
