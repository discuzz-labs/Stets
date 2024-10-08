import { Suite } from "./framework/Suite";
import { SpecReporter } from "./lib/SpecReporter";
import { TestError } from "./lib/TestError"
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
  duration: number;
  error: string;
  file?: string;
  line?: string;
  char?: string;
};

export type TestSuccessParams = {
  description: string;
  duration: number;
};

export type SuiteFailedParams = {
  description: string;
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

export type SuiteCase = {
  status: "pending" | "success" | "failed";
  reports: { id: number, description: string, duration: number, error?: TestError}[]
  path: string;
  suite: Suite;
  duration: number;
};

export type TestConfig = {
  testDirectory: string;
  filePattern: string | string[];
  exclude: string[];
  reporters: ("html" | "json" | "spec")[];
  outputDir: string;
  silent: boolean;
};
export type Reporters = SpecReporter
export type ConfigOptions = keyof TestConfig;
export type StetsConfig = Partial<TestConfig>;
export type CLIOptions = Partial<TestConfig> & {
  verbose?: boolean;
  logLevel?: string;
  config?: string;
};