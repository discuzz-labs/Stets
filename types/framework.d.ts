/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;
export type Status = "passed" | "failed" | "soft-failed" | "skipped" | "empty"
export type HookTypes = "afterAll" | "afterEach" | "beforeAll" | "beforeEach"
export type TestCaseStatus = "passed" | "failed" | "pending" |"empty"

export interface ErrorMetadata {
  message: string | undefined;
  stack: string | undefined;
}

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
  status: Status ;
  retries: number;
  error?: ErrorMetadata;
};

export type HookResult = {
  description: HookTypes;
  status: Status;
  retries: number;
  error?: ErrorMetadata;
};

export interface Stats {
  total: number;
  skipped: number;
  passed: number;
  failed: number;
  softFailed: number;
}

export interface TestReport {
  stats: Stats;
  description: string;
  status: TestCaseStatus;
  tests: TestResult[];
  hooks: HookResult[];
}

export interface Options {
  /** The maximum duration in milliseconds to allow for a test or hook to complete. 
  @default 300_000ms or 5 minutes
  */
  timeout?: number;

  /** If true, the test or hook is skipped. */
  skip?: boolean;

  /** 
   * A conditional expression determining whether to run the test or hook.
   * If the value is a function, it can return a boolean or a Promise that resolves to a boolean.
   * If the result is `false`, `null`, or `undefined`, the test or hook is skipped.
   */
  if?: boolean | undefined | null | (() => boolean | Promise<boolean> | null | undefined);

  /** If true, allows the test to "soft-fail," marking it as failed without affecting the entire test suite's status. */
  softFail?: boolean;

  /** Number of retries for a test*/
  retry?: number;

  /** Marks a test as sequencial to be runned in the order it was added */
  sequencial?: number;
}