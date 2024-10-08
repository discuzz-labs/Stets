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

  /**
   * Loads and runs all test suites.
   */
  async runSuites() {
    Log.info("Loading test suites...");
    Log.info(`${this.suiteCases.length} test suites loaded.`);

    // Execute all suites
    await Promise.all(
      this.suiteCases.map(async (suiteCase) => {
        Log.info(`Running suite: ${suiteCase.suite.description}`);
        SpecReporter.onSuiteStart(suiteCase.suite.description);
        await this.runSuite(suiteCase);
      }),
    );

    console.clear();
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
            await suite.beforeEachFn();
            await test.fn();
            await suite.afterEachFn();

            suiteCase.reports.push({
              id,
              description: test.description,
              duration: -1,
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
              duration: -1,
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
