/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import type { CLIOptions } from "../cli/ArgParser.js";
import kleur from "../utils/kleur.js";

const COMMANDS: Record<
  keyof CLIOptions,
  {
    description: string;
    requiresValue: boolean;
    isArray: boolean;
    shortValue: string;
    type: string;
  }
> = {
  help: {
    description:
      "Display this help message with detailed information about all available commands.",
    requiresValue: false,
    isArray: false,
    shortValue: "h",
    type: "",
  },
  create: {
    description: "",
    requiresValue: true,
    isArray: false,
    shortValue: "cr",
    type: "path",
  },
  runtime: {
    description: "",
      requiresValue: true,
      isArray: false,
      shortValue: "rt",
      type: "ts | js",
  },
  outputDir: {
    description:
      "Specify the directory where output files will be saved realtive to cwd.",
    requiresValue: true,
    isArray: false,
    shortValue: "o",
    type: "path",
  },
  formats: {
    description: "List of formats for output (JSON, JUnit, HTML).",
    requiresValue: true,
    isArray: true,
    shortValue: "rf",
    type: "json, junit, html",
  },
  timestamp: {
    description: "Include a timestamp in the report path.",
    requiresValue: false,
    isArray: false,
    shortValue: "",
    type: "boolean",
  },
  version: {
    description: "Display current version",
    requiresValue: false,
    isArray: false,
    shortValue: "v",
    type: "",
  },
  config: {
    description:
      "Specify the path to a file configuration containing test settings and options.",
    requiresValue: true,
    isArray: false,
    shortValue: "c",
    type: "string",
  },
  timeout: {
    description:
      "Set the maximum execution time (in milliseconds) for each individual test file.",
    requiresValue: true,
    isArray: false,
    shortValue: "t",
    type: "number",
  },
  envs: {
    description:
      "Provide path to one or more .env files for loading environment variables during testing.",
    requiresValue: true,
    isArray: true,
    shortValue: "env",
    type: "path[]",
  },
  pattern: {
    description:
      'Specify a glob pattern to match test files (e.g., -p=**/*.test.ts" -p="**/*.spec.js).',
    requiresValue: true,
    isArray: true,
    shortValue: "p",
    type: "regex[]",
  },
  exclude: {
    description:
      'Specify patterns or paths to exclude from test execution (e.g., "node_modules/**").',
    requiresValue: true,
    isArray: true,
    shortValue: "e",
    type: "regex[]",
  },
  file: {
    description:
      "Explicitly list one or more test files to run. (e.g., -f=test.ts -f=test.js)",
    requiresValue: true,
    isArray: true,
    shortValue: "f",
    type: "path[]",
  },
};

function version() {
  return kleur.green("v" + "1.0.0");
}

function help(): string {
  const appName = kleur.blue("Veve");
  const appVersion = version();
  const header = `\nUsage: ${appName} ${appVersion} [options]\n\n${kleur.gray("Options")}:\n`;

  // Sort and process options in a single pass
  const processedOptions = Object.entries(COMMANDS)
    .map(([key, command]) => {
      const optionFlag = `--${key}, -${command.shortValue}`;
      const valuePlaceholder = command.requiresValue ? "=<value>" : "";
      const fullOption = kleur.bold(optionFlag) + valuePlaceholder;

      return {
        key,
        fullOption,
        length: optionFlag.length + valuePlaceholder.length,
        description: command.description,
        type: command.type,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  // Find longest option length in the same array we already created
  const longestOptionLength = Math.max(
    ...processedOptions.map((opt) => opt.length),
  );

  // Build the help message using array join instead of string concatenation
  const optionsText = processedOptions
    .map(({ fullOption, length, description, type }) => {
      const padding = " ".repeat(longestOptionLength - length + 2);
      return `  ${fullOption}${padding}${kleur.gray(description)} ${kleur.cyan(type)}`;
    })
    .join("\n");

  return `${header}${optionsText}\n\nCreated with ❤️  by Discuzz Labs. Copyright 2024 under MIT License.`;
}

export { help, COMMANDS, version };
