/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

// logger.ts

import chalk from 'chalk';

export class Log {
  /**
   * Logs the start of a test.
   * @param testName - The name of the test being started.
   */
  static logTestStart(testName: string) {
    console.log(`${chalk.bgYellow("RUN")} ${testName}`);
  }

  /**
   * Logs the result of a test, including its status and duration.
   * @param testName - The name of the test.
   * @param status - The status of the test ('passed' or 'failed').
   * @param duration - The duration of the test in milliseconds.
   */
  static logTestResult(testName: string, status: any, duration: number | null) {
    const statusSymbol = status === 'passed' ? chalk.green('✓') : chalk.red('✗');
    const statusText = status === 'passed' ? chalk.green('PASSED') : chalk.red('FAILED');
    console.log(`${statusSymbol} ${testName} - ${statusText} in ${duration}ms`);
  }

  /**
   * Logs a summary of all test results.
   * @param totalTests - The total number of tests run.
   * @param failedTests - The number of tests that failed.
   */
  static logSummary(totalTests: number, failedTests: number) {
    const passedTests = totalTests - failedTests;
    console.log(`\nSummary: ${chalk.green(`${passedTests} passed`)}, ${chalk.red(`${failedTests} failed`)}`);
  }
}