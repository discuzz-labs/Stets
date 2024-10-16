import { BaseReporter } from "../reporters/BaseReporter";
import { HookResult, SuiteReport, TestResult, TestFile } from "../types";

export class Reporter {
  private baseReporter = new BaseReporter();
  private allFailedTests = 0;
  private allPassedTests = 0;
  private allDurtaion = 0

  constructor(private testFiles: TestFile[]) {}

  /**
   * Starts the reporting process for all test files.
   */
  report(): void {
    this.testFiles.forEach((testFile) => {
      this.reportTestFile(testFile); // Start with no indentation (level 0)
    });

    console.log(this.baseReporter.onSummary(this.allPassedTests, this.allFailedTests, this.allDurtaion ))
  }

  /**
   * Reports on an individual test file.
   * @param {TestFile} testFile - The test file to report.
   */
  private reportTestFile(testFile: TestFile): void {
    this.allDurtaion += testFile.duration
    // Report test file start
    console.log(
      this.baseReporter.onTestFileReport(testFile.path, testFile.duration),
    );
    testFile.error ? console.log(testFile.error) : "";
    // Report on main suite and any child suites
    testFile.report.children.forEach((suite) => this.reportSuite(suite, 0));
    console.log(""); // Separate the reports for clarity
  }

  /**
   * Reports on a test suite, including any nested suites.
   * @param {SuiteReport} suite - The test suite to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private reportSuite(suite: SuiteReport, indentationLevel: number): void {
    let output = "";
    output = this.baseReporter.onSuiteReport(
      suite.description,
      suite.passedTests,
      suite.failedTests,
    );
    this.writeIndented(output, indentationLevel);

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
    let output = "";
    if (test.passed === false) {
      output = this.baseReporter.onFail(
        test.description,
        test.error?.message || "Unknown error",
      );

      this.writeIndented(output, indentationLevel);
      this.allPassedTests += 1;
    } else {
      this.allFailedTests += 1;
    }
  }

  /**
   * Reports on a test hook (before/after hooks).
   * @param {Hook} hook - The hook to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private reportHook(hook: HookResult, indentationLevel: number): void {
    let output = "";
    if (hook.passed) {
      output = this.baseReporter.onFail(
        `Hook: ${hook.type}`,
        hook.error?.message || "Unknown hook error",
      );

      this.writeIndented(output, indentationLevel);
      this.allPassedTests += 1;
    } else {
      this.allFailedTests += 1;
    }
  }

  /**
   * Generates indentation based on the nesting level.
   * @param {number} level - The level of indentation.
   * @returns {string} - The string representing the indentation.
   */
  private getIndentation(level: number): string {
    return "  ".repeat(level); // Tab character for each level of indentation
  }

  /**
   * Writes indented output using the specified formatted string.
   * @param {string} formattedOutput - The output string to write.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private writeIndented(
    formattedOutput: string,
    indentationLevel: number,
  ): void {
    const indentation = this.getIndentation(indentationLevel);

    // Split the formatted output into lines and indent each line
    const indentedOutput = formattedOutput
      .split("\n")
      .map((line, index) =>
        index === 0 ? indentation + line : indentation + line,
      )
      .join("\n");

    process.stdout.write(indentedOutput + "\n");
  }
}
