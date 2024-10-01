/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import defaultCmd from "./commands/default.cmd";
import { CLIOptions } from "./types";
import { version } from "../package.json";
import { Log } from "./utils/Log";

class CLI {
  private options: CLIOptions = {};

  constructor() {
    this.parseArgs();
    this.run();
  }

  private parseArgs() {
    const args = process.argv.slice(2);
    args.forEach((arg, index) => {
      switch (arg) {
        case "-v":
        case "--verbose":
          this.options.verbose = true;
          break;
        case "--error":
          this.options.logLevel = "error";
          break;
        case "--warning":
          this.options.logLevel = "warning";
          break;
        case "--success":
          this.options.logLevel = "success";
          break;
        case "--info":
          this.options.logLevel = "info";
          break;
      }
    });
  }

  private printHelp() {
    console.log(`
Usage: <command> [options]

Options:
  -v, --verbose         Enable verbose mode
  -h, --help            Display this help message
  -v, -version          Print the version number
    `);
  }

  private run() {
    Log.info("CLI Running")
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
      this.printHelp();
      return;
    }

    if (process.argv.includes("--version") || process.argv.includes("-v")) {
      console.log(`Version: ${version}`);
      return;
    }

    // Cli Options
    if (this.options.verbose == true) {
      Log.info("Setting STETS_VERBOSE=true (user)")
      process.env.STETS_VERBOSE = "true";
    }

    if (this.options.logLevel) {
      Log.info(`Setting STETS_LOGLEVEl=${this.options.logLevel} (user)`)
      process.env.STETS_LOGLEVEL = this.options.logLevel
    } 

    defaultCmd();
  }
}

// Instantiate and run the CLI
new CLI();
