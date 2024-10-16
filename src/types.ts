/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { RuntimeError } from "./errors/RuntimeError";

export type TestFile = {
  status: "pending" | "success" | "failed";
  path: string;
  duration: number;
  error?: RuntimeError;
  report: SuiteReport;
};

export type Test = {
  description: string;
  passed: boolean;
  error: TestError;
};

export type Hook = {
  type: "beforeAll" | "beforeEach";
  passed: boolean;
  error: TestError;
};

export type TestResult = {
  passed: boolean;
  tests: Array<Test>;
  hooks: Array<Hook>;
};

export type SuiteReport = {
  description: string;
  result: TestResult;
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
