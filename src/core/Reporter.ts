import { BaseReporter } from "../reporters/BaseReporter";
import { HookResult, SuiteReport, TestResult, TestFile } from "../types";
import { ErrorFormatter } from "../utils/ErrorFormatter";

export class Reporter {
  private baseReporter = new BaseReporter();
  private allFailedTests = 0;
  private allPassedTests = 0;
  private allDuration = 0;

  constructor(private testFiles: TestFile[]) {}

  /**
   * Starts the reporting process for all test files.
   */
  async report() {
    for (const testFile of this.testFiles) {
      await this.reportTestFile(testFile);
    }
    this.reportSummary(); // Call this after reporting all test files
  }

  private reportSummary() {
    this.baseReporter.onSummary(
      this.allPassedTests,
      this.allFailedTests,
      this.allDuration,
    );
  }

  /**
   * Reports on an individual test file.
   * @param {TestFile} testFile - The test file to report.
   */
  private async reportTestFile(testFile: TestFile) {
    this.allDuration += testFile.duration;

    // Report test file start
    this.baseReporter.onTestFileReport(testFile.path, testFile.duration);

    // Report any error in the test file
    if (testFile.error) {
      const formattedError = await new ErrorFormatter().format(testFile.error.message, testFile.error.stack ?? "");
      console.log(formattedError)
    }

    // Report on main suite and any child suites
    for (const suite of testFile.report.children) {
      await this.reportSuite(suite, 0);
    }

    console.log()
  }

  /**
   * Reports on a test suite, including any nested suites.
   * @param {SuiteReport} suite - The test suite to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private async reportSuite(suite: SuiteReport, indentationLevel: number) {
    this.baseReporter.onSuiteReport(
      suite.description,
      suite.passedTests,
      suite.failedTests,
      indentationLevel
    );

    // Report hooks (setup/teardown)
    for (const hook of suite.hooks) {
      await this.reportHook(hook, indentationLevel);
    }

    // Report individual tests within the suite
    for (const test of suite.tests) {
      await this.reportTest(test, indentationLevel);
    }

    // Recursively report on child suites (nested suites)
    for (const childSuite of suite.children) {
      await this.reportSuite(childSuite, indentationLevel + 1);
    }
  }

  /**
   * Reports on an individual test.
   * @param {Test} test - The test to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private async reportTest(test: TestResult, indentationLevel: number) {
    if (!test.passed) {
      await this.baseReporter.onFail(
        test.description,
        test.error || { message: "Unexpected Error", stack: "" },
        indentationLevel
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
  private async reportHook(hook: HookResult, indentationLevel: number) {
    if (!hook.passed) {
      await this.baseReporter.onFail(
        `Hook: ${hook.type}`,
        hook.error || { message: "Unexpected Error", stack: "" },
        indentationLevel
      );
      this.allFailedTests += 1;
    } else {
      this.allPassedTests += 1;
    }
  }
}
