/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import chalk from "chalk";
import { Options } from "./Options";

export class Log {
  static isVerbose() {
    return Options.hasOption("verbose") && Options.getOption("verbose")?.toLowerCase() === "true";
  }
  
  static schouldBe(logLevel: string) {
    return Options.hasOption("logLevel") && Options.getOption("logLevel") === logLevel.toLowerCase();
  }

  static error(message: string) {
    if (this.schouldBe("error") || this.isVerbose() ) {
      console.log(`[${chalk.green("ERROR")}]`, message);
    }
  }

  static warning(message: string) {
    if (this.schouldBe("warning") || this.isVerbose() ) {
      console.log(`[${chalk.green("WARNING")}]`, message);
    }
  }

  static info(message: string) {
    if (this.schouldBe("info") || this.isVerbose() ) {
      console.log(`[${chalk.green("INFO")}]`, message);
    }
  }

  static success(message: string) {
    if (this.schouldBe("success") || this.isVerbose() ) {
      console.log(`[${chalk.green("SUCCESS")}]`, message);
    }
  }
}
