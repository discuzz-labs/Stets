import { BaseReporter } from "../reporters/BaseReporter";
import { HookResult, SuiteReport, TestResult, TestFile } from "../types";
import { ErrorFormatter } from "../utils/ErrorFormatter";

export class Reporter {
  private baseReporter = new BaseReporter();
  private allFailedTests = 0;
  private allPassedTests = 0;
  private allDurtaion = 0;

  constructor(private testFiles: TestFile[]) {}

  /**
   * Starts the reporting process for all test files.
   */
  report() {
    this.testFiles.forEach(async (testFile) => {
      await this.reportTestFile(testFile); // Start with no indentation (level 0)
    });

    /*this.baseReporter.onSummary(
      this.allPassedTests,
      this.allFailedTests,
      this.allDurtaion,
    );*/
  }

  /**
   * Reports on an individual test file.
   * @param {TestFile} testFile - The test file to report.
   */
  private async reportTestFile(testFile: TestFile) {
    this.allDurtaion += testFile.duration;
    // Report test file start

    this.baseReporter.onTestFileReport(testFile.path, testFile.duration),
      testFile.error ? await new ErrorFormatter().format(testFile.error.message, testFile.error.stack ?? "") : "";
    // Report on main suite and any child suites
    testFile.report.children.forEach((suite) => this.reportSuite(suite, 0));
    process.stdout.write(""); // Separate the reports for clarity
  }

  /**
   * Reports on a test suite, including any nested suites.
   * @param {SuiteReport} suite - The test suite to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private reportSuite(suite: SuiteReport, indentationLevel: number): void {
    this.baseReporter.onSuiteReport(
      suite.description,
      suite.passedTests,
      suite.failedTests,
    );

    // Report hooks (setup/teardown)
    suite.hooks.forEach((hook) => this.reportHook(hook, indentationLevel + 1));

    // Report individual tests within the suite
    suite.tests.forEach((test) => this.reportTest(test, indentationLevel + 1));

    // Recursively report on child suites (nested suites)
    suite.children.forEach((childSuite) =>
      this.reportSuite(childSuite, indentationLevel + 1),
    );
  }

  /**
   * Reports on an individual test.
   * @param {Test} test - The test to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private reportTest(test: TestResult, indentationLevel: number): void {
    if (test.passed === false) {
      this.baseReporter.onFail(
        test.description,
        test.error || { message: "Unexpected Error", stack: ""}
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
  private reportHook(hook: HookResult, indentationLevel: number): void {
    if (hook.passed === false) {
      this.baseReporter.onFail(
        `Hook: ${hook.type}`,
         hook.error || { message: "Unexpected Error", stack: ""}
      );
      this.allFailedTests += 1;
    } else {
      this.allPassedTests += 1;
    }
  }
}
