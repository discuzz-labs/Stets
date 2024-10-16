/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";
import { Config } from "../config/Config";
import path from "path";

type ErrorParams = {
  description: string;
  error: string;
};

type SuccessParams = {
  description: string;
};

type IgnoredParams = {
  description: string;
};

type SuiteFailedParams = {
  description: string;
  duration: number;
};

type SuiteSuccessParams = {
  description: string;
  duration: number;
};

type TestFileStartParams = {
  path: string;
};

type TestFileSuccessParams = {
  path: string;
  duration: number;
};

type TestFileFailedParams = {
  path: string;
  duration: number;
  error: string;
};

type SummaryParams = {
  totalSuites: number;
  failedSuites: number;
  succeededSuites: number;

  totalTests: number;
  failedTests: number;
  succeededTests: number;
  ignoredTests: number;

  duration: number;
};

export class BaseReporter {
  private config = Config.init();
  private silent: boolean = this.config.get("silent");
  private usesColors: boolean = this.config.get("useColors"); // Add this option

  /**
   * Formats the arguments into a single string, joining them with a newline.
   * @param {...string[]} args - The strings to format.
   * @returns {string} - The formatted string.
   */
  private format(...args: string[]): string {
    return `${args.join("\n")}`;
  }

  /**
   * Reports the start of a test file.
   * @param {TestFileStartParams} params - The parameters containing information about the test file.
   * @returns {string} - The formatted test file start message.
   */
  onTestFileStart(params: TestFileStartParams): string {
    const { path: filePath } = params;
    const directoryPath = path.dirname(filePath);
    const fileName = path.basename(filePath);

    if (this.usesColors) {
      return `${kleur.bgYellow(" RUNNING ")} ${kleur.grey(directoryPath)}${kleur.black(`/${fileName}`)}`;
    } else {
      return `RUNNING ${directoryPath}/${fileName}`;
    }
  }

  /**
   * Reports the success of a test file.
   * @param {TestFileSuccessParams} params - The parameters containing information about the successful test file.
   * @returns {string} - The formatted test file success message.
   */
  onTestFileSuccess(params: TestFileSuccessParams): string {
    const { path: filePath, duration } = params;
    const directoryPath = path.dirname(filePath);
    const fileName = path.basename(filePath);

    if (this.usesColors) {
      return `${kleur.bgGreen(" PASSED ")} ${kleur.grey(directoryPath)}${kleur.black(`/${fileName}`)} in ${duration} ms`;
    } else {
      return `PASSED ${directoryPath}/${fileName} in ${duration} ms`;
    }
  }

  /**
   * Reports the failure of a test file.
   * @param {TestFileFailedParams} params - The parameters containing information about the failed test file.
   * @returns {string} - The formatted test file failure message.
   */
  onTestFileFailed(params: TestFileFailedParams): string {
    const { path: filePath, duration, error } = params;
    const directoryPath = path.dirname(filePath);
    const fileName = path.basename(filePath);

    if (this.usesColors) {
      return `${kleur.bgRed(" FAILED ")} ${kleur.grey(directoryPath)}${kleur.black(`/${fileName}`)} in ${duration} ms\n${error}`;
    } else {
      return `FAILED ${directoryPath}/${fileName} in ${duration} ms\n${error}`;
    }
  }

  /**
   * Reports the success of a test suite.
   * @param {SuiteSuccessParams} params - The parameters containing information about the successful suite.
   * @returns {string} - The formatted suite success message.
   */
  onSuiteSuccess(params: SuiteSuccessParams): string {
    if (this.usesColors) {
      return this.format(
        `${kleur.bgGreen(" PASSED ")} Suite: ${params.description} in ${params.duration} ms`
      );
    } else {
      return this.format(
        `PASSED Suite: ${params.description} in ${params.duration} ms`
      );
    }
  }

  /**
   * Reports the failure of a test suite.
   * @param {SuiteFailedParams} params - The parameters containing information about the failed suite.
   * @returns {string} - The formatted suite failure message.
   */
  onSuiteFailed(params: SuiteFailedParams): string {
    if (this.usesColors) {
      return this.format(
        `${kleur.bgRed(" FAIL ")} Suite: ${params.description} in ${params.duration} ms`
      );
    } else {
      return this.format(
        `FAIL Suite: ${params.description} in ${params.duration} ms`
      );
    }
  }

  /**
   * Reports a failed test.
   * @param {ErrorParams} params - The parameters containing information about the failed test.
   * @returns {string} - The formatted test failure message.
   */
  onError(params: ErrorParams): string {
    const { description, error } = params;

    if (this.usesColors) {
      return this.format(
        `${kleur.red("•")} ${kleur.gray(description)} failed`,
        error
      );
    } else {
      return this.format(
        `• ${description} failed`,
        error
      );
    }
  }

  /**
   * Reports a successful test.
   * @param {SuccessParams} params - The parameters containing information about the successful test.
   * @returns {string} - The formatted test success message.
   */
  onSuccess(params: SuccessParams): string {
    if (this.silent) return "";
    const { description } = params;

    if (this.usesColors) {
      return this.format(
        `${kleur.green("•")} ${kleur.gray(description)} passed`
      );
    } else {
      return this.format(
        `• ${description} passed`
      );
    }
  }

  /**
   * Reports an ignored test.
   * @param {IgnoredParams} params - The parameters containing information about the ignored test.
   * @returns {string} - The formatted test ignored message.
   */
  onIgnored(params: IgnoredParams): string {
    if (this.silent) return "";
    const { description } = params;

    if (this.usesColors) {
      return this.format(
        `${kleur.yellow("•")} ${kleur.gray(description)} ignored`
      );
    } else {
      return this.format(
        `• ${description} ignored`
      );
    }
  }

  /**
   * Reports a summary of the test results.
   * @param {SummaryParams} params - The parameters containing the summary of the test results.
   * @returns {string} - The formatted summary message.
   */
  onSummary(params: SummaryParams): string {
    const {
      totalSuites,
      succeededSuites,
      totalTests,
      failedTests,
      succeededTests,
      ignoredTests,
      duration,
    } = params;

    const passedSuitesText = `${succeededSuites} passed`;
    const passedTests = `${succeededTests} passed`;
    const failedTestsText = `${failedTests} failed`;
    const ignoredTestsText = `${ignoredTests} ignored`;

    const summary = [
      `Suites:  ${this.usesColors ? kleur.green(passedSuitesText) : passedSuitesText} out of ${this.usesColors ? kleur.gray(totalSuites) : totalSuites} total`,
      `Tests:   ${this.usesColors ? kleur.green(passedTests) : passedTests} ${this.usesColors ? kleur.red(failedTestsText) : failedTestsText} ${this.usesColors ? kleur.yellow(ignoredTestsText) : ignoredTestsText} out of ${this.usesColors ? kleur.gray(totalTests) : totalTests} total`,
      `Time:    ${this.usesColors ? kleur.gray(duration) : duration} ms`,
    ];

    return this.format(summary.join("\n")) + "\n" + (this.usesColors ? kleur.grey("Ran all test suites.") : "Ran all test suites.");
  }
}
