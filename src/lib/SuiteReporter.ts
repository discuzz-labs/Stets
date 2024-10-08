import { Reporters } from "../types";
import { Log } from "../utils/Log";
import { SuiteCase } from "../types";
import { SpecReporter } from "../reporters/SpecReporter";

export class SuiteReporter {
  private reporters: Reporters[] = [new SpecReporter()];

  /**
   * Reports all the test suites and their results.
   * @param suites - The array of test suites with their results.
   */
  public reportSuites(suiteCases: SuiteCase[]): void {
    Log.info("Starting to report test suites...");

    suiteCases.forEach((suiteCase) => {
      this.reportSuite(suiteCase);
      this.reportSuiteCaseTests(suiteCase);
    });

    const failed = suiteCases.filter(
      (suiteCase) => suiteCase.status === "failed",
    ).length;
    Log.info(`Reporting completed. ${failed} suites failed.`);

    this.reporters.forEach((reporter) => {
      reporter.onSummary({
        total: suiteCases.length,
        failed,
        duration: suiteCases.reduce(
          (acc, suiteCase) => acc + suiteCase.duration,
          0,
        ),
      });
    });

    process.exit(failed > 0 ? 1 : 0);
  }

  /**
   * Reports a single suite's results, whether success or failure.
   * @param suite - The suite to report.
   */
  private reportSuite(suiteCase: SuiteCase): void {
    Log.info(`Reporting results for suite: ${suiteCase.suite.description} , status: ${suiteCase.status}`);

    this.reporters.forEach((reporter) => {
      if (suiteCase.status === "success") {
        reporter.onSuiteSuccess({
          description: suiteCase.suite.description,
          duration: suiteCase.duration,
        });
      } else {
        reporter.onSuiteFailed({
          description: suiteCase.suite.description,
          duration: suiteCase.duration,
        });
      }
    });
  }

  private reportSuiteCaseTests(suiteCase: SuiteCase) {
    this.reporters.forEach((reporter) => {
      suiteCase.reports.forEach((report) => {
        if (report.error) {
          let stackTrace = report.error.stackTrace();
          reporter.onTestFailed({
            description: report.description,
            duration: report.duration,
            error: report.error.toString(),
            line: stackTrace.line,
            char: stackTrace.char,
            file: stackTrace.file,
          });
        } else {
          reporter.onTestSuccess({
            description: report.description,
            duration: report.duration,
          });
        }
      });
    });
  }
}
