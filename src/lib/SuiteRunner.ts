/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteCase } from "../types";
import { Log } from "../utils/Log";
import { TestError } from "./TestError";

export class SuiteRunner {
  private suiteCase: SuiteCase;

  constructor(suiteCase: SuiteCase) {
    this.suiteCase = suiteCase;
  }

  async runSuite(): Promise<void> {
    let suite = this.suiteCase.suite;
    let hasFailure = false; // Track if any test fails

    try {
      Log.info(`Executing 'beforeAll' for suite: ${suite.description}`);
      await suite.beforeAllFn();

      await Promise.all(
        suite.tests.map(async (test, id) => {
          const testStartTime = Date.now(); // Start tracking test duration

          try {
            Log.info(`Running test: ${test.description}`);

            await suite.beforeEachFn();
            await test.fn();
            await suite.afterEachFn();
          } catch (error: any) {
            const testError = new TestError({
              description: test.description,
              message: error.message,
              stack: error.stack,
            });
            Log.error(`Test failed: ${test.description}, ${error}`);

            // Push failed test details
            this.suiteCase.reports.push({
              id,
              description: test.description,
              error: testError,
              duration: -1, // Mark as -1 if failure occurs, but this will be overwritten below
            });

            hasFailure = true; // Flag that a failure occurred
          } finally {
            // Calculate the test duration regardless of success or failure
            const testEndTime = Date.now();
            const testDuration = testEndTime - testStartTime;

            // Update the report entry with the actual duration
            const report = this.suiteCase.reports.find(
              (report) => report.id === id,
            );
            if (report) {
              report.duration = testDuration;
            } else {
              this.suiteCase.reports.push({
                id,
                description: test.description,
                duration: testDuration, // Set duration if it succeeds
              });
            }
          }
        }),
      );

      Log.info(`Executing 'afterAll' for suite: ${suite.description}`);
      await suite.afterAllFn();

      // Set the final suite status based on whether there were any failures
      this.suiteCase.status = hasFailure ? "failed" : "success";
    } catch (error: any) {
      Log.error(`Error during suite execution: ${suite.description}, ${error}`);
      this.suiteCase.status = "failed"; // If any exception occurs during the suite run
    }
  }
}
