/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import path from "path";
import {
  SuiteFailedParams,
  SuiteSuccessParams,
  SummaryParams,
  TestFailedParams,
  TestSuccessParams,
  Report,
  TestIgnoredParams
} from "../types";
import { File } from "../utils/File"
import { Config } from "../lib/Config";
import { Log } from "../utils/Log";
import { SpecReporter } from "./SpecReporter";

export class JsonReporter extends SpecReporter{
  reportType: string = "json"
  
  results: Report = {
    suites: [],
    totalSuites: 0,
    failedSuites: 0,
    succededSuites: 0,

    totalTests: 0,
    failedTests: 0,
    succededTests: 0,
    ignoredTests: 0,
    
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
    this.results.failedSuites++;
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
    this.results.succededSuites++;
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
    this.results.failedTests++
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
    this.results.succededTests++
  }

  /**
   * Reports an ingored test.
   * @param {TestIgnoredParams} params - The parameters containing information about the ignored test.
   */
  onTestIgnored(params: TestIgnoredParams): void {
    const { description } = params;
    const testResult = {
      description,
      status: "ignored",
      duration: 0
    };

    this.results.suites[this.results.suites.length - 1].tests.push(testResult);
    this.results.ignoredTests++
  }

  /**
   * Logs a summary of the test results.
   * @param {SummaryParams} params - The parameters containing the total and failed test counts.
   */
  onSummary(params: SummaryParams): void {
    const { totalSuites, totalTests, failedSuites, succededSuites, failedTests, succededTests, ignoredTests, duration } = params;
    this.results.totalSuites = totalSuites;
    this.results.failedSuites = failedSuites;
    this.results.succededSuites = succededSuites;

    this.results.totalTests = totalTests;
    this.results.failedTests = failedTests;
    this.results.succededTests = succededTests;
    this.results.ignoredTests = ignoredTests;
    this.results.duration = duration;

    console.log(
      this.format(
        `=====💥 ${this.reportType} report=====`, 
        this.formatReportFile()
      )
    );

    this.writeReport()
  }

  public writeReport(): void {
    const config = Config.getInstance();
    const outputDir = config.getConfig("outputDir") ? config.getConfig("outputDir") : "test-results";
    Log.info(`Output directory: ${outputDir}`)
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `report-${timestamp}.${this.reportType}`; // Example file naming
    
    new File(path.join(process.cwd(), outputDir, this.reportType, filePath)).writeFile(this.formatReportFile())
    
    console.log(`${this.reportType} Report written to ${filePath}`);
  }

  formatReportFile() : string {
    return JSON.stringify(this.results, null, 4)
  }
}
