/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import kleur from "./kleur";

export class Log {
  // Define log levels in descending order of priority
  private static logLevelPriority: Record<string, number> = {
    error: 1,
    warn: 2,
    success: 3,
    info: 4,
  };

  // Static variables for log level and verbosity
  private static logLevel: string;
  private static verbose: boolean = false;

  // Static initialization method to configure the logger
  constructor(logLevel: string = "", verbose: boolean = false) {
    Log.logLevel = logLevel.toLowerCase();
    Log.verbose = verbose;
  }

  // Check if the message should be logged based on the current log level
  private static shouldBe(logLevel: string): boolean {
    return (
      Log.logLevelPriority[logLevel.toLowerCase()] <=
      Log.logLevelPriority[Log.logLevel]
    );
  }

  // Check if verbose mode is enabled
  private static isVerbose(): boolean {
    return Log.verbose;
  }

  // Static log methods using console
  public static error(message: string) {
    if (Log.shouldBe("error") || Log.isVerbose()) {
      console.error(`[${kleur.red("ERROR")}] ${message}`);
    }
  }

  public static warn(message: string) {
    if (Log.shouldBe("warn") || Log.isVerbose()) {
      console.warn(`[${kleur.yellow("WARNING")}] ${message}`);
    }
  }

  public static info(message: string) {
    if (Log.shouldBe("info") || Log.isVerbose()) {
      console.info(`[${kleur.blue("INFO")}] ${message}`);
    }
  }

  public static success(message: string) {
    if (Log.shouldBe("success") || Log.isVerbose()) {
      console.log(`[${kleur.green("SUCCESS")}] ${message}`);
    }
  }
}
