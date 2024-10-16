/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export type TestFile = {
  status: "pending" | "success" | "failed";
  path: string;
  duration: number;
  error?: Error;
  report: SuiteReport;
};

export type TestResult = {
  description: string;
  passed: boolean;
  error: TestError;
};

export type HookResult = {
  type: "beforeAll" | "beforeEach";
  passed: boolean;
  error: TestError;
};

export type SuiteReport = {
  passed: boolean;
  description: string;
  passedTests: number;
  failedTests: number;
  tests: Array<TestResult>;
  hooks: Array<HookResult>;
  children: SuiteReport[];
  error: TestError;
};

export type TestError = {
  message: string | null;
  stack: string | null;
};

export type TestConfig = {
  testDirectory: string;
  filePattern: string | string[];
  exclude: string[];
  suppressValidations: boolean;
  //reporters
  reporters: ("html" | "json" | "spec" | "md" | "xml" | "csv")[];
  outputDir: string;

  clearConsole: boolean;
  useColors: boolean;
};

export type StetsConfig = Partial<TestConfig>;
