export type TestFunction = () => void | Promise<void>;

export type HookFunction = () => void | Promise<void>;

export interface ErrorMetadata {
  /** The error message, if available. */
  message: string | undefined;
  /** The error stack trace, if available. */
  stack: string | undefined;
}

export interface Options {
  /** The maximum duration in milliseconds to allow for a test or hook to complete. */
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
  retry: number;
}


export interface Test {
  /** The description of the test case. */
  description: string;
  /** The function to execute for the test case. */
  fn: TestFunction;
  /** The configuration options for the test case. */
  options: Options;
}

export interface Hook {
  /** The type of hook. */
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  /** The function to execute for the hook. */
  fn: HookFunction;
  /** The configuration options for the hook. */
  options: Options;
}

export type TestResult = {
  /** The description of the test case. */
  description: string;
  /** The status of the test case. */
  status: "passed" | "failed" | "skipped";
  /** Metadata for any error encountered during test execution. */
  error?: ErrorMetadata;
};

export type HookResult = {
  /** The type of hook executed. */
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  /** The status of the hook execution. */
  status: "passed" | "failed" | "skipped";
  /** Metadata for any error encountered during hook execution. */
  error?: ErrorMetadata;
};

export interface Stats {
  /** The total number of tests. */
  total: number;
  /** The number of tests that were skipped. */
  skipped: number;
  /** The number of tests that passed. */
  passed: number;
  /** The number of tests that failed. */
  failed: number;
}

export interface TestReport {
  /** Summary statistics for the test suite. */
  stats: Stats;
  /** Description of the test suite. */
  description: string;
  /** The overall status of the test suite based on test results. */
  status: "passed" | "failed";
  /** Results for each individual test case. */
  tests: TestResult[];
  /** Results for each hook executed during the test suite. */
  hooks: HookResult[];
}
