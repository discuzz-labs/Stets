/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { CLIOptions } from "../types";

const COMMANDS: Record<
  keyof CLIOptions,
  {
    description: string;
    requiresValue: boolean;
    isArray: boolean;
    shortValue: string;
  }
> = {
  config: {
    description: "Path to the configuration file",
    requiresValue: true,
    isArray: false,
    shortValue: "c",
  },
  logLevel: {
    description: "Set the logging level",
    requiresValue: true,
    isArray: false,
    shortValue: "l",
  },
  verbose: {
    description: "Enable verbose logging",
    requiresValue: false,
    isArray: false,
    shortValue: "v",
  },
  testDirectory: {
    description: "Set a directory to search for test files.",
    requiresValue: true,
    isArray: false,
    shortValue: "t",
  },
  pattern: {
    description: "Set a file pattern to search for tests",
    requiresValue: true,
    isArray: false,
    shortValue: "p",
  },
  outputDir: {
    description: "Directory to write reporters into. (Default=test-result)",
    requiresValue: true,
    isArray: false,
    shortValue: "o",
  },
  exclude: {
    description: "Exclude specific directories or files from testing",
    requiresValue: true,
    isArray: false,
    shortValue: "e",
  },
  reporters: {
    description: "Specify reporters to use for test results",
    requiresValue: true,
    isArray: true,
    shortValue: "rp",
  },
  maxTestFiles: {
    description: "Set the maximum number of test files to process",
    isArray: false,
    requiresValue: true,
    shortValue: "mtf",
  },
  file: {
    description: "files to run.",
    requiresValue: true,
    isArray: true,
    shortValue: "f",
  },
  env: {
    description: "Env files to load.",
    requiresValue: true,
    isArray: true,
    shortValue: "env",
  }
};

export default COMMANDS;
