/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import { ArgsParser } from "../cli/ArgParser";
import kleur from "./kleur";

export class Log {
  // Define log levels in descending order of priority
  static logLevelPriority: Record<string, number> = {
    "error": 1,
    "warn": 2,
    "success": 3,
    "info": 4
  };

  // Get current log level from options or default to "info"
  static getCurrentLogLevel(): string {
    return ArgsParser.get("logLevel")?.toLowerCase() || "";
  }

  // Check if the message should be logged based on the current log level
  static schouldBe(logLevel: string): boolean {
    const currentLogLevel = this.getCurrentLogLevel();
    return this.logLevelPriority[logLevel.toLowerCase()] <= this.logLevelPriority[currentLogLevel];
  }

  // Check if verbose mode is enabled
  static isVerbose(): boolean {
    return ArgsParser.has("verbose") && ArgsParser.get("verbose")?.toLowerCase() === "true";
  }

  static error(message: string) {
    if (this.schouldBe("error") || this.isVerbose()) {
      process.stdout.write(`[${kleur.red("ERROR")}] ${message} \n`);
    }
  }

  static warn(message: string) {
    if (this.schouldBe("warning") || this.isVerbose()) {
      process.stdout.write(`[${kleur.yellow("WARNING")}] ${message} \n`);
    }
  }

  static info(message: string) {
    if (this.schouldBe("info") || this.isVerbose()) {
      process.stdout.write(`[${kleur.blue("INFO")}]  ${message} \n`);
    }
  }

  static success(message: string) {
    if (this.schouldBe("success") || this.isVerbose()) {
      process.stdout.write(`[${kleur.green("SUCCESS")}] ${message} \n`);
    }
  }
}