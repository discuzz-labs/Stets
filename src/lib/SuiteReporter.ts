import { Reporters } from "../types";
import { Log } from "../utils/Log";
import { SuiteCase } from "../types";
import { SpecReporter } from "../reporters/SpecReporter";
import { Config } from "./Config";
import { JsonReporter } from "../reporters/JsonReporter";
import { HtmlReporter } from "../reporters/HtmlReporter";
import { MdReporter } from "../reporters/MdReporter";
import { CSVReporter } from "../reporters/CSVReporter";
import { XMLReporter } from "../reporters/XMLReporter";

export class SuiteReporter {
  private reporters: Reporters[] = [];

  constructor() {
    const config = Config.getInstance();
    const reporters = config.getConfig("reporters");

    // Check if reporters is defined
    if (reporters) {
      // Handle the case when reporters is a string (single reporter)
      if (typeof reporters === "string") {
        this.reporters.push(this.createReporter(reporters));
      } else if (Array.isArray(reporters)) {
        reporters.forEach((reporter) => {
          this.reporters.push(this.createReporter(reporter));
        });
      }
    } else {
      Log.info("Using default reporter: spec");
      this.reporters.push(this.createReporter("spec"));
    }
  }

  /**
   * Helper method to create a reporter instance based on the name.
   * @param {string} reporterName - The name of the reporter to create.
   * @returns {any} - The reporter instance.
   */
  createReporter(reporterName: string): any {
    switch (reporterName.toLowerCase()) {
      case "spec":
        return new SpecReporter();
      case "json":
        return new JsonReporter();
      case "html":
        return new HtmlReporter();
      case "md":
        return new MdReporter();
      case "csv":
        return new CSVReporter();
      case "xml":
        return new XMLReporter()
      default:
        console.error(
          `Unknown reporter: ${reporterName}. Expected: spec, html, json, xml, csv or md`,
        );
        process.exit(1);
    }
  }
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
    Log.info(
      `Reporting results for suite: ${suiteCase.suite.description} , status: ${suiteCase.status}`,
    );

    this.reporters.forEach((reporter) => {
      if (suiteCase.status === "success") {
        reporter.onSuiteSuccess({
          description: suiteCase.suite.description,
          duration: suiteCase.duration,
          path: suiteCase.path,
        });
      } else {
        reporter.onSuiteFailed({
          description: suiteCase.suite.description,
          duration: suiteCase.duration,
          path: suiteCase.path,
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
