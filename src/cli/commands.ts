/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import type { CLIOptions } from "../cli/ArgParser";

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
  envs: {
    description: "Path to .env file relative to cwd()",
    requiresValue: true,
    isArray: false,
    shortValue: "env",
  },
  pattern: {
    description: "Set a file pattern to search for tests",
    requiresValue: true,
    isArray: false,
    shortValue: "p",
  },
  exclude: {
    description: "Exclude specific directories or files from testing",
    requiresValue: true,
    isArray: false,
    shortValue: "e",
  },
  file: {
    description: "files to run.",
    requiresValue: true,
    isArray: true,
    shortValue: "f",
  }
};

export default COMMANDS;
