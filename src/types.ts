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

export type TestFile = {
  status: "pending" | "success" | "failed" ;
  path: string;
  duration: number;
  suites: Array<Suite>; // Array of suites
};

export type Suite = {
  name: string; // Name of the suite
  status: "pending" | "success" | "failed" | "ignored"; // Suite status
  duration: number; // Total duration of the suite
  tests: Array<Test>; // Array of tests within the suite
};

export type Test = {
  status: "success" | "ignored" | "failed"; // Test status
  id: number;
  description: string;
  duration: number;
  error?: RuntimeError; // Error is optional, only required when status is "failed"
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