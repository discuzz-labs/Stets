/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import chalk from "chalk";

export class Log {
  static isVerbose() {
    return process.env.STETS_VERBOSE === "true";
  }

  static schouldBe(logLevel: string) {
    return process.env.STETS_LOGLEVEL === logLevel;
  }

  static error(message: string) {
    if (this.isVerbose() || this.schouldBe("error")) {
      console.log("[", chalk.red("ERROR"), "] ", message);
    }
  }

  static warning(message: string) {
    if (this.isVerbose() || this.schouldBe("warning")) {
      console.log("[", chalk.yellow("WARNING"), "] ", message);
    }
  }

  static info(message: string) {
    if (this.isVerbose() || this.schouldBe("info")) {
      console.log("[", chalk.blue("INFO"), "] ", message);
    }
  }

  static success(message: string) {
    if (this.isVerbose() || this.schouldBe("success")) {
      console.log("[", chalk.green("SUCCESS"), "] ", message);
    }
  }
}
