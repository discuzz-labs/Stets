import { BaseReporter } from "../reporters/BaseReporter";
import { HookResult, SuiteReport, TestResult } from "../types"

export class Reporter {
  static baseReporter = BaseReporter;
  static allFailedTests = 0;
  static allPassedTests = 0;
  static allDuration = 0;

  /**
   * Reports on an individual test file.
   * @param {TestFile} testFile - The test file to report.
   */
  static reportTestFile(file: string, duration: number) {
    Reporter.allDuration += duration;

    // Report test file start
    this.baseReporter.onTestFileReport(file, duration);
  }
  /**
   * Reports on a test suite, including any nested suites.
   * @param {SuiteReport} suite - The test suite to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  static reportSuite(suite: SuiteReport, indentationLevel: number) {
    this.baseReporter.onSuiteReport(
      suite.description,
      suite.passedTests,
      suite.failedTests,
      indentationLevel,
    );

    // Report hooks (setup/teardown)
    for (const hook of suite.hooks) {
      this.reportHook(hook, indentationLevel);
    }

    // Report individual tests within the suite
    for (const test of suite.tests) {
      this.reportTest(test, indentationLevel);
    }

    // Recursively report on child suites (nested suites)
    for (const childSuite of suite.children) {
      this.reportSuite(childSuite, indentationLevel + 1);
    }
  }

  /**
   * Reports on an individual test.
   * @param {Test} test - The test to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private static reportTest(test: TestResult, indentationLevel: number) {
    if (!test.passed) {
      this.baseReporter.onFail(
        test.description,
        test.error || { message: "Unexpected Error", stack: "" },
        indentationLevel,
      );

      this.allFailedTests += 1;
    } else {
      this.allPassedTests += 1;
    }
  }

  /**
   * Reports on a test hook (before/after hooks).
   * @param {Hook} hook - The hook to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private static reportHook(hook: HookResult, indentationLevel: number) {
    if (!hook.passed) {
      this.baseReporter.onFail(
        `Hook: ${hook.type}`,
        hook.error || { message: "Unexpected Error", stack: "" },
        indentationLevel,
      );
      this.allFailedTests += 1;
    } else {
      this.allPassedTests += 1;
    }
  }

  static reportSummary() {
    this.baseReporter.onSummary(
      this.allPassedTests,
      this.allFailedTests,
      this.allDuration,
    );
  }
}
