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
  TestIgnoredParams,
  SuiteRunParams
} from "../types";
import { Config } from "../config/Config";
import path from "path";

export class SpecReporter {
  private silent: boolean = false;
  
  constructor() {
    const config = Config.getInstance()
    if(config.getConfig("silent")) this.silent = true
  }
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
   * @param {SuiteRunParams} params - The name of the test suite being started.
   */

  static onSuiteStart(params: SuiteRunParams): void {
    const { description, path: filePath } = params;

    // Get the directory path and the file name separately
    const directoryPath = path.dirname(filePath);  // Get the directory path
    const fileName = path.basename(filePath);      // Get the file name


    console.log(
      `${chalk.bgYellowBright(" RUNNING " )} Suite: ${description} at ${chalk.grey(directoryPath)}${chalk.black(`/${fileName}`)}`
    );
  }

  /**
   * Reports a failed test suite.
   * @param {SuiteFailedParams} params - The parameters containing information about the failed suite.
   */
  onSuiteFailed(params: SuiteFailedParams): void {
    console.log(
      this.format(
        `${chalk.bgRed(" FAIL ")} Suite: ${params.description} at ${chalk.gray(params.path)} in ${params.duration}ms`
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
        `${chalk.bgGreen(" PASSED ")} Suite: ${params.description} at ${chalk.gray(params.path)} in ${params.duration}ms`
      )
    );
  }


  /**
   * Reports a failed test.
   * @param {TestFailedParams} params - The parameters containing information about the failed test.
   */
  onTestFailed(params: TestFailedParams): void {
    const { description, error, duration } = params;
    console.log(
      this.format(
        `${chalk.red("•")} Test: ${chalk.gray(description)} failed in ${duration} ms`,
        error
      )
    );
  }
  
  /**
   * Reports a successful test.
   * @param {TestSuccessParams} params - The parameters containing information about the successful test.
   */
  onTestSuccess(params: TestSuccessParams): void {
    if(this.silent) return
    const { description, duration } = params;
    console.log(
      this.format(`${chalk.green("•")} Test: ${chalk.gray(description)} passed in ${duration}ms`)
    );
  }

  /**
   * Reports an ingored test.
   * @param {TestIgnoredParams} params - The parameters containing information about the ignored test.
   */
  onTestIgnored(params: TestIgnoredParams): void {
    if(this.silent) return
    const { description } = params;
    console.log(
      this.format(`${chalk.yellow("•")} Test: ${chalk.gray(description)} ignored`)
    );
  }
  
  /**
   * Reports a summary of the test results.
   * @param {SummaryParams} params - The parameters containing the total and failed test counts.
   */

  onSummary(params: SummaryParams): void {
    const { 
      totalSuites, 
      succededSuites, 
      totalTests,
      failedTests, 
      succededTests, 
      ignoredTests, 
      duration 
    } = params;

    const passedSuitesText = `${succededSuites} passed`;
    const passedTests = `${succededTests} passed`;
    const failedTestsText = `${failedTests} failed`;
    const ignoredTestsText = `${ignoredTests} ignored`;

    const summary = [
      `Suites:  ${chalk.green(passedSuitesText)} out of ${chalk.gray(totalSuites)} total`,
      `Tests:   ${chalk.green(passedTests)} ${chalk.red(failedTestsText)} ${chalk.yellow(ignoredTestsText)} out of ${chalk.gray(totalTests)} total`,
      `Time:    ${chalk.gray(duration)} ms`
    ];

    console.log(this.format(summary.join("\n")));

    console.log(chalk.grey("Ran all test suites."))
  }
}
