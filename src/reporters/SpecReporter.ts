/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import chalk from "chalk";
import {
  SuiteFailedParams,
  SuiteSuccessParams,
  SummaryParams,
  TestFailedParams,
  TestSuccessParams,
} from "../types";

export class SpecReporter {
  /**
   * Formats the arguments into a single string, joining them with a newline.
   * @param {...string[]} args - The strings to format.
   * @returns {string} - The formatted string.
   */
  format(...args: string[]): string {
    return `\n${args.join("\n")}`;
  }

  /**
   * Reports the start of a test suite.
   * @param {string} suiteName - The name of the test suite being started.
   */
  static onSuiteStart(suiteName: string): void {
    console.log(`${chalk.bgYellow("RUN")} ${suiteName}`);
  }

  /**
   * Reports a failed test suite.
   * @param {SuiteFailedParams} params - The parameters containing information about the failed suite.
   */
  onSuiteFailed(params: SuiteFailedParams): void {
    console.log(
      this.format(
        `${chalk.red("✗")} Suite: ${params.description} at ${chalk.gray(params.path)} - ${chalk.red("FAILED")} in ${params.duration}ms`
      )
    );
  }

  /**
   * Reports a successful test suite.
   * @param {SuiteSuccessParams} params - The parameters containing information about the successful suite.
   */
  onSuiteSuccess(params: SuiteSuccessParams): void {
    console.log(
      this.format(
        `${chalk.green("✓")} Suite: ${params.description} at ${chalk.gray(params.path)} - ${chalk.green("PASSED")} in ${params.duration}ms`
      )
    );
  }

  /**
   * Reports a failed test.
   * @param {TestFailedParams} params - The parameters containing information about the failed test.
   */
  onTestFailed(params: TestFailedParams): void {
    const { description, error, file, line, char, duration } = params;
    console.log(
      this.format(
        `${chalk.red("•")} Test: ${chalk.gray(description)} failed in ${duration} ms`,
        error,
        `At: ${chalk.blue(file)} ${chalk.yellow(line)}:${chalk.yellow(char)}`
      )
    );
  }

  /**
   * Reports a successful test.
   * @param {TestSuccessParams} params - The parameters containing information about the successful test.
   */
  onTestSuccess(params: TestSuccessParams): void {
    const { description, duration } = params;
    console.log(
      this.format(`${chalk.green("•")} Test: ${chalk.gray(description)} passed in ${duration}ms`)
    );
  }

  /**
   * Reports a summary of the test results.
   * @param {SummaryParams} params - The parameters containing the total and failed test counts.
   */
  onSummary(params: SummaryParams): void {
    const { total, failed, duration } = params;
    const passed = total - failed;
    console.log(
      this.format(
        `=====💥 Finished in ${chalk.gray(duration)} ms=====`, 
        `Total: ${chalk.gray(total)}`,
        `Passed: ${chalk.green(`${passed} passed`)}`,
        `Failed: ${chalk.red(`${failed} failed`)}`,
      )
    );
  }
}
