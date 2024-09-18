/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Command } from "commander";
import defaultCmd from "./commands/default.cmd";
import {Config} from "./lib/Config"

const program = new Command();

program
  .version("1.0.0")
  .description("A TypeScript native testing framework")
  .option("-v, --verbose", "Enable verbose logging")
  .option("-b, --bail", "Stop on first test failure")
  .option(
    "-t, --timeout <ms>",
    "Set the test timeout in milliseconds",
    parseInt,
  )
  .option("-d, --testDirectory <path>", "Set the test directory")
  .option("-p, --filePattern <pattern>", "Set the test file pattern");

// Needs more adjustements [Unusable]
//const config = TestConfig.getInstance(program).getConfig();

program.action(defaultCmd);
program.parse(process.argv);