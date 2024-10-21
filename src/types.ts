/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
export type CLIOptions = Partial<TestConfig> & {
  verbose?: boolean;
  logLevel?: string;
  config?: string;
  maxTestFiles?: number;
  file?: string[];
  env?: string[];
};

export type TestFile = {
  path: string;
};

export type TestResult = {
  description: string;
  passed: boolean;
  error?: { message: string, stack: string};
};

export type HookResult = {
  type: "beforeAll" | "beforeEach";
  passed: boolean;
  error? : { message: string, stack: string};
};

export type SuiteReport = {
  passed: boolean;
  description: string;
  passedTests: number;
  failedTests: number;
  tests: Array<TestResult>;
  hooks: Array<HookResult>;
  children: SuiteReport[];
  error?: string;
};

export type TestConfig = {
  testDirectory: string;
  pattern: string | string[];
  exclude: string | string[];
  //reporters
  reporters: ("html" | "json" | "spec" | "md" | "xml" | "csv")[];
  outputDir: string;

  env: string[];
};

export type StetsConfig = Partial<TestConfig>;
