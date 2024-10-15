/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { RuntimeError } from "./errors/RuntimeError";

export type TestFailedParams = {
  description: string;
  duration: number;
  error: string;
};

export type TestSuccessParams = {
  description: string;
  duration: number;
};

export type TestIgnoredParams = {
  description: string;
};

export type SuiteFailedParams = {
  path: string;
  description: string;
  duration: number;
};

export type SuiteSuccessParams = {
  path: string;
  description: string;
  duration: number;
};

export type SuiteRunParams = {
  path: string;
  description: string;
};

export type SummaryParams = {
  totalSuites: number;
  failedSuites: number;
  succeededSuites: number;

  totalTests: number;
  failedTests: number;
  succeededTests: number;
  ignoredTests: number;
  
  duration: number;
};

export type SuiteCase = {
  status: "pending" | "success" | "failed" | "ignored"
  reports: Array<
    | {
        status: "success" | "ignored";
        id: number;
        description: string;
        duration: number;
        error?: undefined; // No error when success or ignored
      }
    | {
        status: "failed";
        id: number;
        description: string;
        duration: number;
        error: RuntimeError; // Error is required when status is failed
      }
  >;
  path: string;
  duration: number;
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

  tsconfig: string;
  ignoreDefault: boolean;
  ignoreDiscovered: boolean;

  clearConsole: boolean;
};

export type StetsConfig = Partial<TestConfig>;