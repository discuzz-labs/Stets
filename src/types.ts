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

export type TestResult = {
  description: string;
  status: "passed" | "failed" | "skipped";
  error?: { message: string; stack: string };
};

export type HookResult = {
  type: "beforeAll" | "beforeEach";
  status: "passed" | "failed" | "skipped";
  error?: { message: string; stack: string };
};

export type SuiteReport = {
  passed: boolean;
  description: string;
  metrics: {
    passed: number;
    failed: number;
    skipped: number;
  };
  tests: Array<TestResult>;
  hooks: Array<HookResult>;
  children: SuiteReport[];
  error?: string;
};

interface TransformerConfig {
  pattern: RegExp;
  fn: (code: string) => Promise<string> | string;
}

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
