/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
export type TestFunction = () => Promise<void> | void;
export type Test = {
  description: string;
  fn: TestFunction;
};

export type TestFailedParams = {
  description: string;
  error: string;
  file: string;
  line: string;
  char: string;
  affectedLine: string;
};

export type TestSuccessParams = {
  description: string;
};

export type SuiteFailedParams = {
  description: string;
  error: string;
  duration: number;
};

export type SuiteSuccessParams = {
  description: string;
  duration: number;
};

export type SummaryParams = {
  total: number;
  failed: number;
  duration: number;
};

export type Suite = {
  status: "pending" | "success" | "failed";
  path: string;
  stdout: string;
};

export type TestConfig = {
  testDirectory: string;
  filePattern: string | string[];
  exclude: string[];
};

export type ConfigOptions = keyof TestConfig;
export type StetsConfig = Partial<TestConfig>;
export type CLIOptions = Partial<TestConfig> & {
  verbose?: boolean;
  logLevel?: string;
  config?: string;
};
