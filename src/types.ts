import { Suite } from "./framework/Suite";
import { SpecReporter } from "./reporters/SpecReporter";
import { TestError } from "./lib/TestError";
import { JsonReporter } from "./reporters/JsonReporter";
import { HtmlReporter } from "./reporters/HtmlReporter";
import { MdReporter } from "./reporters/MdReporter";
import { XMLReporter } from "./reporters/XMLReporter";
import { CSVReporter } from "./reporters/CSVReporter";
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
  path: string;
  description: string;
  duration: number;
};

export type SuiteSuccessParams = {
  path: string;
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
  reports: {
    id: number;
    description: string;
    duration: number;
    error?: TestError;
  }[];
  path: string;
  suite: Suite;
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
  
};

export type Reporters =
  | SpecReporter
  | JsonReporter
  | HtmlReporter
  | MdReporter
  | XMLReporter
  | CSVReporter;

export type Report = {
  suites: {
    description: string;
    status: string;
    duration: number;
    path: string;
    tests: {
      description: string;
      status: string;
      duration: number;
      error?: {
        message: string;
        location: {
          file?: string;
          line?: string;
          char?: string;
        };
      };
    }[];
  }[];
  total: number;
  passed: number;
  failed: number;
  duration: number;
};

export type ConfigOptions = keyof TestConfig;
export type StetsConfig = Partial<TestConfig>;
export type CLIOptions = Partial<TestConfig> & {
  verbose?: boolean;
  logLevel?: string;
  config?: string;
};
