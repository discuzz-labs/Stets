/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestReport } from "../framework/TestCase";
import { Formatter } from "../utils/Formatter";
import kleur from "../utils/kleur";
import path from "path";

export class BaseReporter {
  static start(file: string) {
    const dirPath = path.dirname(file);
    const fileName = path.basename(file);
    console.log(
      kleur.bgYellow(" RUNNING ") +
        kleur.gray(dirPath) +
        kleur.black("" + fileName + "") +
        "\n",
    );
  }

  static case(file: string, duration: number, report: TestReport) {
    console.log(
      kleur.underline(kleur.bold(report.description)) +
        " at " +
        kleur.gray(file) +
        " in " +
        kleur.gray(duration) +
        " ms " +
        "\n" +
        kleur.yellow("Skipped: " + report.stats.skipped) +
        " " +
        kleur.green("Passed: " + report.stats.passed) +
        " " +
        kleur.red("Failed: " + report.stats.failures)
    );
  }

  static fail(
    description: string,
    error: { message: string; stack: string },
    file: string,
  ) {
    console.log(
      "\n" +
        kleur.bgRed(kleur.bold(" FAILED ")) +
        " " +
        kleur.bgBlack(kleur.white("" + description + "")) +
        "\n",
    );
    Formatter.formatError(error.message, error.stack, 10, file);
  }

  static success(description: string) {
    console.log(
      "\n" +
        kleur.bgGreen(kleur.bold(" PASSED ")) +
        " " +
        kleur.bgBlack(kleur.white("" + description + "")) +
        "\n",
    );
  }

  static skipped(description: string) {
    console.log(
      "\n" +
        kleur.bgYellow(kleur.bold(" SKIPPED ")) +
        " " +
        kleur.bgBlack(kleur.white("" + description + "")) +
        "\n",
    );
  }
}
