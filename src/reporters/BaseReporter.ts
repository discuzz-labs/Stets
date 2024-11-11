/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestReport } from "../framework/TestCase";
import { ErrorParser } from "../utils/ErrorParser";
import kleur from "../utils/kleur";
import path from "path";

export class BaseReporter {
  static start(file: string): string {
    const dirPath = path.dirname(file);
    const fileName = path.basename(file);
    return (
      kleur.bgYellow(" RUNNING ") +
      " " +
      kleur.gray(dirPath) +
      "/" +
      kleur.white(fileName)
    );
  }

  static case(
    testCaseName: string,
    file: string,
    duration: number,
    stats: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
    },
  ): string {
    // Determine the color of testCaseName based on test results
    const name = stats.failed > 0
    ? kleur.red(kleur.bold(testCaseName))
    : kleur.green(kleur.bold(testCaseName));

    return (
      name+
      ` (${stats.total} / ${stats.passed})` + // Display stats as (total / passed)
      " at " +
      kleur.gray(path.dirname(file)) +
      " in " +
      kleur.gray(`${duration} ms`) +
      "\n\n"
    );
  }

  static fail(
    description: string,
    error: { message: string; stack: string },
    file: string,
  ): string {
    const errorDetails = ErrorParser.format(error, {
      filter: file,
      maxLines: 10,
    });
    return (
      kleur.bgRed(kleur.bold(" FAILED ")) +
      " " +
      kleur.bgBlack(kleur.white(description)) +
      "\n" +
      errorDetails +
      "\n"
    );
  }

  static skipped(description: string): string {
    return (
      kleur.bgYellow(kleur.bold(" SKIPPED ")) +
      " " +
      kleur.bgBlack(kleur.white(description)) +
      "\n"
    );
  }

  static finish(file: string, status: boolean): string {
    const dirPath = path.dirname(file);
    const fileName = path.basename(file);
    return (
      (status ? kleur.bgGreen(" PASSED ") : kleur.bgRed(" FAILED ")) +
      " " +
      kleur.gray(dirPath) +
      "/" +
      kleur.white(fileName)
    );
  }

  static summary(stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  }): string {
    const { total, passed, failed, skipped } = stats;
    const passedPercentage =
      total > 0 ? ((passed / total) * 100).toFixed(2) : "0.00";
    const failedPercentage =
      total > 0 ? ((failed / total) * 100).toFixed(2) : "0.00";
    const skippedPercentage =
      total > 0 ? ((skipped / total) * 100).toFixed(2) : "0.00";

    return (
      "\n" +
      kleur.white("Total: ") +
      `${total}` +
      "\n" +
      kleur.green("Passed: ") +
      `${passed} (${kleur.bold(passedPercentage)}%)` +
      "\n" +
      kleur.red("Failed: ") +
      `${failed} (${kleur.bold(failedPercentage)}%)` +
      "\n" +
      kleur.yellow("Skipped: ") +
      `${skipped} (${kleur.bold(skippedPercentage)}%)` +
      kleur.gray("\n\n🍾 ⚡️ All Tests ran!")
    );
  }
}
