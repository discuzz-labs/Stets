/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import chalk from "chalk";
import { Options } from "./Options";

export class Log {
  // Define log levels in descending order of priority
  static logLevelPriority: Record<string, number> = {
    "error": 1,
    "warning": 2,
    "success": 3,
    "info": 4
  };

  // Get current log level from options or default to "info"
  static getCurrentLogLevel(): string {
    return Options.getOption("logLevel")?.toLowerCase() || "info";
  }

  // Check if the message should be logged based on the current log level
  static schouldBe(logLevel: string): boolean {
    const currentLogLevel = this.getCurrentLogLevel();
    return this.logLevelPriority[logLevel.toLowerCase()] <= this.logLevelPriority[currentLogLevel];
  }

  // Check if verbose mode is enabled
  static isVerbose(): boolean {
    return Options.hasOption("verbose") && Options.getOption("verbose")?.toLowerCase() === "true";
  }

  static error(message: string) {
    if (this.schouldBe("error") || this.isVerbose()) {
      console.log(`[${chalk.red("ERROR")}]`, message);
    }
  }

  static warning(message: string) {
    if (this.schouldBe("warning") || this.isVerbose()) {
      console.log(`[${chalk.yellow("WARNING")}]`, message);
    }
  }

  static info(message: string) {
    if (this.schouldBe("info") || this.isVerbose()) {
      console.log(`[${chalk.blue("INFO")}]`, message);
    }
  }

  static success(message: string) {
    if (this.schouldBe("success") || this.isVerbose()) {
      console.log(`[${chalk.green("SUCCESS")}]`, message);
    }
  }
}