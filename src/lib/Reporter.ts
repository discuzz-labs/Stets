/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import chalk from 'chalk';
import { SuiteFailedParams, SuiteSuccessParams, SummaryParams, TestFailedParams, TestSuccessParams } from '../types';

export class Reporter {
  /**
   * Formats the arguments into a single string, joining them with a newline.
   * @param {...string[]} args - The strings to format.
   * @returns {string} - The formatted string.
   */
  private static format(...args: string[]): string {
      return `\n${args.join('\n')}\n`;
  }

  /**
   * Reports the start of a test suite.
   * @param {string} suiteName - The name of the test suite being started.
   * @returns {string} - The formatted start message.
   */
  static onSuiteStart(suiteName: string): string {
    return `${chalk.bgYellow("RUN")} ${suiteName}`;
  }

  /**
   * Reports a failed test suite.
   * @param {SuiteFailedParams} params - The parameters containing information about the failed suite.
   * @returns {string} - The formatted failure message.
   */
  static onSuiteFailed(params: SuiteFailedParams): string {
    return this.format(
      `${chalk.red("✗")} ${params.description} - ${chalk.red("FAILED")} in ${params.duration}ms`,
      params.error
    );
  }

  /**
   * Reports a successful test suite.
   * @param {SuiteSuccessParams} params - The parameters containing information about the successful suite.
   * @returns {string} - The formatted success message.
   */
  static onSuiteSuccess(params: SuiteSuccessParams): string {
    return this.format(`${chalk.green("✓")} ${params.description} - ${chalk.green("PASSED")} in ${params.duration}ms`);
  }

  /**
   * Reports a failed test.
   * @param {TestFailedParams} params - The parameters containing information about the failed test.
   * @returns {string} - The formatted test failure message.
   */
  static onTestFailed(params: TestFailedParams): string {
    const { description, error, file, line, char, affectedLine } = params;
    return this.format(
      `${chalk.red("•")} Test: ${chalk.gray(description)}`,
      error,
      `At: ${chalk.blue(file)} ${chalk.yellow(line)}:${chalk.yellow(char)}`,
      chalk.gray(affectedLine),
      "\n"
    );
  }

  /**
   * Reports a successful test.
   * @param {TestSuccessParams} params - The parameters containing information about the successful test.
   * @returns {string} - The formatted test success message.
   */
  static onTestSuccess(params: TestSuccessParams): string {
    const { description } = params;
    return this.format(`${chalk.green("•")} Test: ${chalk.gray(description)}`);
  }

  /**
   * Reports a summary of the test results.
   * @param {SummaryParams} params - The parameters containing the total and failed test counts.
   * @returns {string} - The formatted summary message.
   */
  static onSummary(params: SummaryParams): string {
    const { total, failed, duration } = params;
    const passed = total - failed;
    return this.format(
      `Summary: ${chalk.green(`${passed} passed`)}, ${chalk.red(`${failed} failed`)} in ${chalk.gray(duration)} ms`
    );
  }

  static noSuitesFound(filePattern: string[] | string, testDirectory: string) {
    // Normalize filePattern to an array
    const patterns = Array.isArray(filePattern) ? filePattern : [filePattern];
    // Format the output message
    return this.format(
      `No suites were found applying the following pattern: ${chalk.blue(patterns.join(', '))} in the following directory: ${chalk.blue(testDirectory)}`
    );
  }
}