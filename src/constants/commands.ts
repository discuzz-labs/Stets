/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

const COMMANDS: Record<
  string,
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
    description: "Set a diretory to search for test files. ",
    requiresValue: true,
    shortValue: "t",
  },
  filePattern: {
    description: "Set a fioe pattern to search for tests",
    requiresValue: true,
    shortValue: "f",
  },
  silent: {
    description: "Show errors only",
    requiresValue: true,
    shortValue: "s",
  },
  outputDir: {
    description: "Directory to write reporters into. (Default=test-result)",
    requiresValue: true,
    shortValue: "o",
  },
  useColors: {
    description: "Set if you want a colored output.",
    requiresValue: false,
    shortValue: "co",
  },
  clearConsole: {
    description: "Clear console before reporting",
    requiresValue: false,
    shortValue: "cc",
  },
};

export default COMMANDS;
