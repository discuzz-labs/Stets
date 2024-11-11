/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestReport, TestResult } from "../framework/TestCase";
import { BaseReporter } from "./BaseReporter";

interface TestCaseReportOptions {
  testCaseName: string;
  duration: number;
  file: string;
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

interface TestReportOptions {
  file: string;
  report: TestReport;
}

export class Reporter {
  // Static field to accumulate test statistics
  static stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  static start(file: string): string {
    return BaseReporter.start(file);
  }

  static finish(file: string, status: boolean): string {
    return BaseReporter.finish(file, status);
  }

  static case(options: TestCaseReportOptions): string {
    const { testCaseName, file, duration, stats} = options;
    return BaseReporter.case(testCaseName, file, duration, stats);
  }

  static report(options: TestReportOptions): string {
    const { file, report } = options;

    // Initialize an output array to build the final string
    const output: string[] = [];

    const functions = [...report.tests, ...report.hooks];

    functions.forEach((test: TestResult) => {
      // Update stats based on each test result
      Reporter.stats.total += 1;
      switch (test.status) {
        case "failed":
          Reporter.stats.failed += 1;
          if (test.error) {
            output.push(BaseReporter.fail(test.description, test.error, file));
          }
          break;
        case "passed":
          Reporter.stats.passed += 1;
          break;
        case "skipped":
          Reporter.stats.skipped += 1;
          output.push(BaseReporter.skipped(test.description));
          break;
        default:
          output.push(
            `Warning: Unknown status "${test.status}" for ${test.description}`,
          );
      }
    });

    // If no tests or hooks were run, add an "empty" message to the output
    if (functions.length === 0) {
      output.push(`${report.description} is empty!`);
    }

    // Join all elements of the output array with newlines and add to the output
    const finalOutput = output.join("\n");

    // Return the accumulated output
    return finalOutput;
  }

  // Method to display a summary of the test results
  static summary(): string {
    return BaseReporter.summary(this.stats);
  }
}
