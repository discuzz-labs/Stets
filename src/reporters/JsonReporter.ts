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
  TestIgnoredParams
} from "../types";
import { File } from "../utils/File"
import { Config } from "../config/Config";
import { Log } from "../utils/Log";
import { SpecReporter } from "./SpecReporter";

type JsonReport = {
  suites: {
    description: string;
    status: string;
    duration: number;
    path: string;
    tests: {
      description: string;
      status: string;
      duration: number;
      error?: {
        message: string;
      };
    }[];
  }[];
  totalSuites: number;
  failedSuites: number;
  succededSuites: number;

  totalTests: number;
  failedTests: number;
  succededTests: number;
  ignoredTests: number;

  duration: number;
};

export class JsonReporter extends SpecReporter{
  reportType: string = "json"
  
  results: JsonReport = {
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
    const { description, error,  duration } = params;
    const testResult = {
      description,
      status: "failed",
      duration,
      error: {
        message: error
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

  public onSummary(): void {
    const config = Config.init();
    const outputDir = config.get("outputDir") ? config.get("outputDir") : "test-results";
    
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
