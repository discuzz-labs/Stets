import { BaseReporter } from "../reporters/BaseReporter";
import { HookResult, SuiteReport, TestResult } from "../framework/Suite";

export class Reporter {
  static baseReporter = BaseReporter;
  static metrics = {
    passed: 0,
    failed: 0,
    duration: 0,
  };

  /**
   * Reports on an individual test file.
   * @param {TestFile} testFile - The test file to report.
   */
  static reportTestFile(file: string, duration: number) {
    Reporter.metrics.duration += duration;

    // Report test file start
    this.baseReporter.onTestFileReport(file, duration);
  }
  /**
   * Reports on a test suite, including any nested suites.
   * @param {SuiteReport} suite - The test suite to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  static reportSuite(
    suite: SuiteReport,
    file: string,
    indentationLevel: number = -1,
  ) {
    this.baseReporter.onSuiteReport(
      suite.description,
      suite.metrics.passed,
      suite.metrics.failed,
      indentationLevel,
    );

    // Report hooks (setup/teardown)
    for (const hook of suite.hooks) {
      this.reportHook(hook, file, indentationLevel);
    }

    // Report individual tests within the suite
    for (const test of suite.tests) {
      this.reportTest(test, file, indentationLevel);
    }

    // Recursively report on child suites (nested suites)
    for (const childSuite of suite.children) {
      this.reportSuite(childSuite, file, indentationLevel + 1);
    }
  }

  /**
   * Reports on an individual test.
   * @param {Test} test - The test to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private static reportTest(
    test: TestResult,
    file: string,
    indentationLevel: number,
  ) {
    if (test.status === "failed") {
      this.baseReporter.onFail(
        test.description,
        test.error || { message: "Unexpected Error", stack: "" },
        file,
        indentationLevel,
      );

      this.metrics.failed += 1;
    } else {
      this.metrics.passed += 1;
    }
  }

  /**
   * Reports on a test hook (before/after hooks).
   * @param {Hook} hook - The hook to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private static reportHook(
    hook: HookResult,
    file: string,
    indentationLevel: number,
  ) {
    if (hook.status === "failed") {
      this.baseReporter.onFail(
        `Hook: ${hook.description}`,
        hook.error || { message: "Unexpected Error", stack: "" },
        file,
        indentationLevel,
      );
    }
  }

  static reportSummary() {
    this.baseReporter.onSummary(
      this.metrics.passed,
      this.metrics.failed,
      this.metrics.duration,
    );
  }
}
