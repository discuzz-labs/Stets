/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { CLIOptions } from "../types";

const COMMANDS: Record<
  keyof CLIOptions,
  { description: string; requiresValue: boolean; shortValue: string }
> = {
  config: {
    description: "Path to the configuration file",
    requiresValue: true,
    shortValue: "c",
  },
  logLevel: {
    description: "Set the logging level",
    requiresValue: true,
    shortValue: "l",
  },
  verbose: {
    description: "Enable verbose logging",
    requiresValue: false,
    shortValue: "v",
  },
  testDirectory: {
    description: "Set a directory to search for test files.",
    requiresValue: true,
    shortValue: "t",
  },
  pattern: {
    description: "Set a file pattern to search for tests",
    requiresValue: true,
    shortValue: "p",
  },
  outputDir: {
    description: "Directory to write reporters into. (Default=test-result)",
    requiresValue: true,
    shortValue: "o",
  },
  exclude: {
    description: "Exclude specific directories or files from testing",
    requiresValue: true,
    shortValue: "e",
  },
  reporters: {
    description: "Specify reporters to use for test results",
    requiresValue: true,
    shortValue: "r",
  },
  useColors: {
    description: "Enable or disable colored output in the test results",
    requiresValue: false,
    shortValue: "color",
  },
  maxTestFiles: {
    description: "Set the maximum number of test files to process",
    requiresValue: true,
    shortValue: "mtf",
  },
};

export default COMMANDS;
