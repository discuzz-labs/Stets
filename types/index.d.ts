/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.

 */

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface TestOptions {
  timeout?: number;
  skip?: boolean;
}

export interface HookOptions {
  timeout?: number;
}

export interface Test {
  description: string;
  fn: TestFunction;
  timeout: number;
  skip: boolean;
}

export interface Hook {
  type: "beforeAll" | "beforeEach";
  fn: HookFunction;
  timeout: number;
}

export interface SuiteCase {
  description: string;
  tests: Test[];
  hooks: Hook[];
  children: SuiteCase[];
}

/**
 * Represents a test suite.
 * @class
 */
declare class Suite {
  /**
   * Registers a new describe block.
   * @param {string} description - The description of the describe block.
   * @param {function} callback - The function containing tests/hooks to register in the new suite.
   */
  describe(description: string, callback: () => void): void;

  /**
   * Registers a test case.
   * @param {string} description - The description of the test case.
   * @param {TestFunction} fn - The test function to execute.
   * @param {TestOptions} [options] - Options for the test case.
   */
  it(description: string, fn: TestFunction, options?: TestOptions): void;

  /**
   * Registers a beforeAll hook.
   * @param {HookFunction} fn - The hook function to execute before all tests.
   * @param {HookOptions} options - Options for the hook.
   */
  beforeAll(fn: HookFunction, options: HookOptions): void;

  /**
   * Registers a beforeEach hook.
   * @param {HookFunction} fn - The hook function to execute before each test.
   * @param {HookOptions} [options] - Options for the hook.
   */
  beforeEach(fn: HookFunction, options?: HookOptions): void;

  /**
   *
   * Runs the test suite and returns the root suite case.
   * @returns {SuiteCase} The root suite case.
   */
  run(): SuiteCase;
}

export = Suite