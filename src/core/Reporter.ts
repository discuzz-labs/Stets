import { BaseReporter } from "../reporters/BaseReporter";
import { RuntimeError } from "../errors/RuntimeError";
import { Hook, SuiteReport, Test, TestFile } from "../types";

export class Reporter {
  private baseReporter = new BaseReporter();

  constructor(private testFiles: TestFile[]) {}

  /**
   * Starts the reporting process for all test files.
   */
  report(): void {
    this.testFiles.forEach((testFile) => {
      this.reportTestFile(testFile); // Start with no indentation (level 0)
    });
  }

  /**
   * Reports on an individual test file.
   * @param {TestFile} testFile - The test file to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private reportTestFile(testFile: TestFile): void {
    // Report test file success or failure
    let output = "";
    if (testFile.status === "success") {
      output = this.baseReporter.onTestFileSuccess({
        path: testFile.path,
        duration: testFile.duration,
      });
    } else {
      output = this.baseReporter.onTestFileFailed({
        path: testFile.path,
        duration: testFile.duration,
        error: testFile.error?.toString() || "",
      });
      if (testFile.error) return; // If there's an error, stop further reporting
    }

    this.writeIndented(output, 0);

    // If test file contains an error, report it
    if (testFile.report.error?.message !== null) {
      const errorOutput = this.baseReporter.onTestFileFailed({
        path: testFile.path,
        duration: testFile.duration,
        error: testFile.report.error.toString(),
      });
      this.writeIndented(errorOutput, 0);
    }

    // Report on main suite and any child suites
    testFile.report.children.forEach((suite) => this.reportSuite(suite, 0));
  }

  /**
   * Reports on a test suite, including any nested suites.
   * @param {SuiteReport} suite - The test suite to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private reportSuite(suite: SuiteReport, indentationLevel: number): void {
    let output = "";
    if (suite.result.passed) {
      output = this.baseReporter.onSuiteSuccess({
        description: suite.description,
        duration: 0,
      });
    } else {
      output = this.baseReporter.onSuiteFailed({
        description: suite.description,
        duration: 0,
      });
    }
    this.writeIndented(output, indentationLevel);

    // Report hooks (setup/teardown)
    suite.result.hooks.forEach((hook) =>
      this.reportHook(hook, indentationLevel + 1),
    );

    // Report individual tests within the suite
    suite.result.tests.forEach((test) =>
      this.reportTest(test, indentationLevel + 1),
    );

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
  private reportTest(test: Test, indentationLevel: number): void {
    let output = "";
    if (test.passed) {
      output = this.baseReporter.onSuccess({
        description: test.description,
      });
    } else {
      output = this.baseReporter.onError({
        description: test.description,
        error: new RuntimeError({
          message: test.error?.message || "An error occurred",
          description: `${test.description} failed`,
          stack: test.error?.stack || "No stack trace available",
        }).toString(),
      });
    }

    this.writeIndented(output, indentationLevel);
  }

  /**
   * Reports on a test hook (before/after hooks).
   * @param {Hook} hook - The hook to report.
   * @param {number} indentationLevel - The current level of indentation for logging.
   */
  private reportHook(hook: Hook, indentationLevel: number): void {
    let output = "";
    if (hook.passed) {
      output = this.baseReporter.onSuccess({
        description: `Hook: ${hook.type}`,
      });
    } else {
      output = this.baseReporter.onError({
        description: `Hook: ${hook.type}`,
        error: new RuntimeError({
          message: hook.error?.message || "Hook error occurred",
          description: `Hook "${hook.type}" failed`,
          stack: hook.error?.stack || "No stack trace available",
        }).toString(),
      });
    }

    this.writeIndented(output, indentationLevel);
  }

  /**
   * Generates indentation based on the nesting level.
   * @param {number} level - The level of indentation.
   * @returns {string} - The string representing the indentation.
   */
  private getIndentation(level: number): string {
    return "\t".repeat(level); // Tab character for each level of indentation
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

    process.stdout.write("\n" + indentedOutput + "\n");
  }
}
