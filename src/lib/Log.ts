/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import chalk from "chalk";

export class Log {
  /**
   * Logs the start of a test.
   * @param {string} testName - The name of the test being started.
   */
  static logTestStart(testName: string) {
    console.log(`${chalk.bgYellow("RUN")} ${testName}`);
  }

  /**
   * Logs a formatted stack trace.
   * @param {string} filePath - The file path where the error occurred.
   * @param {string} line - The line number of the error.
   * @param {string} char - The character position in the line.
   * @param {string} affectedLine - The content of the line where the error occurred.
   * @returns {string} - The formatted stack trace as a string.
   */
  static logStack(filePath: string, line: string, char: string, affectedLine: string) {
    return `${chalk.blue(filePath)} ${chalk.yellow(line)}:${chalk.yellow(char)}\n${chalk.gray(affectedLine)}`;
  }

  /**
   * Logs a test failure message with detailed error information.
   * @param {string} testDescription - The description of the failed test.
   * @param {string} errorDetails - Detailed error information.
   * @param {string} parsedStack - The parsed stack trace.
   * @returns {string} - The formatted error message.
   */
  static logTestFailedError(testDescription: string, errorDetails: string, parsedStack: string) {
    return `\n${chalk.red("•")} Test: ${chalk.gray(testDescription)}\n${errorDetails}\nAt: ${parsedStack}\n`;
  }

  /**
   * Logs a failed test suite with optional errors.
   * @param {string} testSuiteDescription - The description of the test suite.
   * @param {string[]} [testSuiteErrors] - Optional array of error messages.
   */
  static logTestSuiteFailed(testSuiteDescription: string, testSuiteErrors?: string[]) {
    console.error(`\nTest Suite: ${testSuiteDescription}\n${testSuiteErrors ? testSuiteErrors.join('\n') : ""}\n`);
  }

  /**
   * Logs the result of a test, including its status and duration.
   * @param {string} testName - The name of the test.
   * @param {string} status - The status of the test ('passed' or 'failed').
   * @param {number | null} duration - The duration of the test in milliseconds.
   */
  static logTestResult(testName: string, status: string, duration: number | null) {
    const statusSymbol = status === "passed" ? chalk.green("✓") : chalk.red("✗");
    const statusText = status === "passed" ? chalk.green("PASSED") : chalk.red("FAILED");
    console.log(`\n${statusSymbol} ${testName} - ${statusText} in ${duration}ms\n`);
  }

  /**
   * Logs a summary of all test results.
   * @param {number} totalTests - The total number of tests run.
   * @param {number} failedTests - The number of tests that failed.
   */
  static logSummary(totalTests: number, failedTests: number) {
    const passedTests = totalTests - failedTests;
    console.log(`\nSummary: ${chalk.green(`${passedTests} passed`)}, ${chalk.red(`${failedTests} failed`)}\n`);
  }
}