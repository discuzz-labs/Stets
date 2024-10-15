import { Log } from "../utils/Log";
import { SuiteCase } from "../types";
import { SpecReporter } from "../reporters/SpecReporter";
import { Config } from "../config/Config";
import { JsonReporter } from "../reporters/JsonReporter";
import { HtmlReporter } from "../reporters/HtmlReporter";
import { XMLReporter } from "../reporters/XMLReporter";

export class Reporter {
  private reporters: any[] = [];
  private config = Config.init();
  private ignored: number = 0;
  private failed: number = 0;
  private succeeded: number = 0;
  private suiteCases: SuiteCase[] = []
  
  constructor(suiteCases: SuiteCase[]) {
    this.suiteCases = suiteCases
    this.initializeReporters();
  }

  /**
   * Initializes the reporters based on the configuration.
   */
  private initializeReporters(): void {
    const reportersToUse = this.config.get("reporters");

    if (!reportersToUse) {
      Log.info("Using default reporter: spec");
      this.reporters.push(this.createReporter("spec"));
      return;
    }

    // Handle both single and multiple reporters
    const reportersList = Array.isArray(reportersToUse) ? reportersToUse : [reportersToUse];
    this.reporters = reportersList.map((reporterName) => this.createReporter(reporterName));
  }

  /**
   * Creates a reporter instance based on the reporter name.
   * @param reporterName - The name of the reporter.
   * @returns - The corresponding reporter instance.
   */
  private createReporter(reporterName: string): any {
    switch (reporterName.toLowerCase()) {
      case "spec":
        return new SpecReporter();
      case "json":
        return new JsonReporter();
      case "html":
        return new HtmlReporter();
      case "xml":
        return new XMLReporter();
      default:
        Log.error(`Unknown reporter: ${reporterName}. Valid options are: spec, html, json, xml.`);
        process.exit(1);
    }
  }

  /**
   * Reports all the test suites and their results.
   * @param suiteCases - The array of test suites.
   */
  public reportSuites(): void {
    Log.info("Reporting test suites...");

    this.suiteCases.forEach((suiteCase) => {
      this.reportSuite(suiteCase);
      this.reportSuiteTests(suiteCase);
    });

    const failedSuites = this.suiteCases.filter((suiteCase) => suiteCase.status === "failed").length;
    Log.info(`Reporting completed. ${failedSuites} suites failed.`);

    this.reportSummary(failedSuites);
    process.exit(failedSuites > 0 ? 1 : 0)
  }

  /**
   * Reports the results of a single test suite.
   * @param suiteCase - The suite to report.
   */
  private reportSuite(suiteCase: SuiteCase): void {
    Log.info(`Reporting results for suite: ${suiteCase.path}, status: ${suiteCase.status}`);

    this.reporters.forEach((reporter) => {
      const suiteReport = {
        description: suiteCase.path,
        duration: suiteCase.duration,
        path: suiteCase.path,
      };

      if (suiteCase.status === "success") {
        reporter.onSuiteSuccess(suiteReport);
      } else {
        reporter.onSuiteFailed(suiteReport);
      }
    });
  }

  /**
   * Reports individual tests within a suite.
   * @param suiteCase - The suite containing the tests.
   */
  private reportSuiteTests(suiteCase: SuiteCase): void {
    suiteCase.reports.forEach((report) => {
      this.reporters.forEach((reporter) => {
        const testReport = {
          description: report.description,
          duration: report.duration,
        };

        if (report.status === "failed") {
          this.failed += 1;
          reporter.onTestFailed({ ...testReport, error: report.error.toString() });
        } else if (report.status === "ignored") {
          this.ignored += 1;
          reporter.onTestIgnored(testReport);
        } else {
          this.succeeded += 1;
          reporter.onTestSuccess(testReport);
        }
      });
    });
  }

  /**
   * Reports a summary of the test results.
   * @param totalSuites - Total number of suites.
   * @param failedSuites - Number of failed suites.
   */
  private reportSummary(failedSuites: number): void {
    const totalTests = this.ignored + this.failed + this.succeeded;
    const summary = {
      totalSuites: this.suiteCases.length,
      failedSuites,
      succeededSuites: this.suiteCases.length - failedSuites,
      totalTests,
      failedTests: this.failed,
      succeededTests: this.succeeded,
      ignoredTests: this.ignored,
      duration: this.suiteCases.length > 0 ? this.suiteCases.reduce((acc, suiteCase) => acc + suiteCase.duration, 0) : 0,
    };

    this.reporters.forEach((reporter) => {
      reporter.onSummary(summary);
    });
  }
}
