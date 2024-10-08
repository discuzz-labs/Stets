import path from "path";
import {
  SuiteFailedParams,
  SuiteSuccessParams,
  SummaryParams,
  TestFailedParams,
  TestSuccessParams,
} from "../types";
import { File } from "../utils/File"
import { Config } from "../lib/Config";
import { Log } from "../utils/Log";
import { SpecReporter } from "./SpecReporter";

export class JsonReporter extends SpecReporter{
  private results: any = {
    suites: [],
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0,
  };

  /**
   * Logs a failed test suite.
   * @param {SuiteFailedParams} params - The parameters containing information about the failed suite.
   */
  onSuiteFailed(params: SuiteFailedParams): void {
    const suiteResult = {
      description: params.description,
      path: params.path,
      status: "failed",
      duration: params.duration,
      tests: [], // Initialize an empty array for tests
    };
    this.results.suites.push(suiteResult);
    this.results.failed++;
  }

  /**
   * Logs a successful test suite.
   * @param {SuiteSuccessParams} params - The parameters containing information about the successful suite.
   */
  onSuiteSuccess(params: SuiteSuccessParams): void {
    const suiteResult = {
      description: params.description,
      path: params.path,
      status: "success",
      duration: params.duration,
      tests: [], // Initialize an empty array for tests
    };
    this.results.suites.push(suiteResult);
    this.results.passed++;
  }

  /**
   * Logs a failed test.
   * @param {TestFailedParams} params - The parameters containing information about the failed test.
   */
  onTestFailed(params: TestFailedParams): void {
    const { description, error, file, line, char, duration } = params;
    const testResult = {
      description,
      status: "failed",
      duration,
      error: {
        message: error,
        location: {
          file,
          line,
          char,
        },
      },
    };

    this.results.suites[this.results.suites.length - 1].tests.push(testResult);
  }

  /**
   * Logs a successful test.
   * @param {TestSuccessParams} params - The parameters containing information about the successful test.
   */
  onTestSuccess(params: TestSuccessParams): void {
    const { description, duration } = params;
    const testResult = {
      description,
      status: "success",
      duration,
    };

    this.results.suites[this.results.suites.length - 1].tests.push(testResult);
  }

  /**
   * Logs a summary of the test results.
   * @param {SummaryParams} params - The parameters containing the total and failed test counts.
   */
  onSummary(params: SummaryParams): void {
    const { total, failed, duration } = params;
    this.results.total = total;
    this.results.failed = failed;
    this.results.passed = total - failed;
    this.results.duration = duration;

    console.log(
      this.format(
        `=====💥 Json report=====`, 
        JSON.stringify(this.results, null, 4)
      )
    );
    
    const config = Config.getInstance();
    const outputDir = config.getConfig("outputDir") ? config.getConfig("outputDir") : "test-results";
    Log.info(`Output directory: ${outputDir}`)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `report-${timestamp}.json`; // Example file naming
    new File(path.join(process.cwd(), "json", outputDir, filePath)).writeJson(this.results)
    console.log(`Json Report written to ${filePath}`);
  }
}
