/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export type TestFile = {
  status: "pending" | "success" | "failed";
  path: string;
  duration: number;
  error?: string ;
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

export type SuiteResult = {
  passed: boolean;
  tests: Array<TestResult>;
  hooks: Array<HookResult>;
};

export type SuiteReport = {
  description: string;
  result: SuiteResult;
  duration: number;
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
  silent: boolean;

  clearConsole: boolean;
  useIdentation: boolean;
  useColors: boolean;
};

export type StetsConfig = Partial<TestConfig>;
