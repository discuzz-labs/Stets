/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteCase } from "../types";
import { Log } from "../utils/Log";
import { SpecReporter } from "../reporters/SpecReporter";
import { SuiteLoader } from "./SuiteLoader";
import { TestError } from "./TestError";

export class SuiteRunner {
  suiteCases: SuiteCase[] = [];

  async init() {
    let suiteLoader = new SuiteLoader();
    await suiteLoader.loadSuites();
    this.suiteCases = suiteLoader.getSuites();
  }

  async runSuites() {
    Log.info("Loading test suites...");
    Log.info(`${this.suiteCases.length} test suites loaded.`);

    // Execute all suites
    await Promise.all(
      this.suiteCases.map(async (suiteCase) => {
        Log.info(`Running suite: ${suiteCase.suite.description}`);
        SpecReporter.onSuiteStart(suiteCase.suite.description);

        const suiteStartTime = Date.now(); // Start tracking suite duration
        await this.runSuite(suiteCase);
        const suiteEndTime = Date.now(); // End tracking suite duration

        // Calculate and set the duration for the whole suite
        suiteCase.duration = suiteEndTime - suiteStartTime;
      }),
    );

    
  }

  /**
   * Runs a single suite, including handling hooks and errors.
   * @param suite The test suite to run.
   */
  private async runSuite(suiteCase: SuiteCase): Promise<void> {
    let suite = suiteCase.suite;
    let hasFailure = false; // Track if any test fails

    try {
      Log.info(`Executing 'beforeAll' for suite: ${suite.description}`);
      await suite.beforeAllFn();

      await Promise.all(
        suite.tests.map(async (test, id) => {
          try {
            Log.info(`Running test: ${test.description}`);

            const testStartTime = Date.now(); // Start tracking test duration
            await suite.beforeEachFn();
            await test.fn();
            await suite.afterEachFn();
            const testEndTime = Date.now(); // End tracking test duration

            // Calculate and store the duration of the individual test
            const testDuration = testEndTime - testStartTime;

            suiteCase.reports.push({
              id,
              description: test.description,
              duration: testDuration, // Log test duration
            });
          } catch (error: any) {
            const testError = new TestError({
              description: test.description,
              message: error.message,
              stack: error.stack,
            });
            Log.error(`Test failed: ${test.description}, ${error}`);

            suiteCase.reports.push({
              id,
              description: test.description,
              error: testError,
              duration: -1, // Duration will not be set if it fails
            });

            hasFailure = true; // Flag that a failure occurred
          }
        }),
      );

      Log.info(`Executing 'afterAll' for suite: ${suite.description}`);
      await suite.afterAllFn();

      // Set the final suite status based on whether there were any failures
      suiteCase.status = hasFailure ? "failed" : "success";
    } catch (error: any) {
      Log.error(`Error during suite execution: ${suite.description}, ${error}`);
      suiteCase.status = "failed"; // If any exception occurs during the suite run
    }
  }
}
