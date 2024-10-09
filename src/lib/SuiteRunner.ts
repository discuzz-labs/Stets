/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Suite } from "../framework/Suite";
import { SuiteCase, Test } from "../types";
import { Log } from "../utils/Log";
import { TestError } from "./TestError";

export class SuiteRunner {
  private suiteCase: SuiteCase;

  constructor(suiteCase: SuiteCase) {
    this.suiteCase = suiteCase;
  }

  // Main method to run the entire suite
  async runSuite(): Promise<void> {
    let hasFailure = false; // Track if any test fails
    const suite = this.suiteCase.suite;

    Log.info(`Executing suite: ${suite.description}`);

    // Run 'beforeAll' hook
    await this.runBeforeAll(suite);

    // Execute all tests in the suite
    await this.runAllTests(suite);

    // Run 'afterAll' hook
    await this.runAfterAll(suite);

    // Set the final suite status
    this.suiteCase.status = hasFailure ? "failed" : "success";
  }

  /**
   * Run the 'beforeAll' hook for the suite.
   */
  private async runBeforeAll(suite: Suite): Promise<void> {
    try {
      Log.info(`Executing 'beforeAll' for suite: ${suite.description}`);
      await suite.beforeAllFn();
    } catch (error: any) {
      this.handleHookFailure("beforeAll", error);
    }
  }

  /**
   * Run the 'afterAll' hook for the suite.
   */
  private async runAfterAll(suite: Suite): Promise<void> {
    try {
      Log.info(`Executing 'afterAll' for suite: ${suite.description}`);
      await suite.afterAllFn();
    } catch (error: any) {
      this.handleHookFailure("afterAll", error);
    }
  }

  /**
   * Run all the tests in the suite.
   */
  private async runAllTests(suite: Suite): Promise<void> {
    await Promise.all(
      suite.tests.map(async (test, id) => {
        await this.runTest(suite, test, id);
      }),
    );
  }

  /**
   * Run an individual test case.
   */
  private async runTest(suite: Suite, test: Test, id: number): Promise<void> {
    const testStartTime = Date.now();

    try {
      Log.info(`Running test: ${test.description}`);

      await suite.beforeEachFn();
      await test.fn();
      await suite.afterEachFn();
    } catch (error: any) {
      this.handleTestFailure(test, id, error);
    } finally {
      this.setTestDuration(id, test.description, testStartTime);
    }
  }

  /**
   * Handle the failure of a test case.
   */
  private handleTestFailure(test: Test, id: number, error: any): void {
    const testError = new TestError({
      description: test.description,
      message: error.message,
      stack: error.stack,
    });

    Log.error(`Test failed: ${test.description}, ${error}`);

    this.suiteCase.reports.push({
      id,
      description: test.description,
      error: testError,
      duration: -1, // Mark as -1 on failure, but it will be overwritten by the final duration
    });
  }

  /**
   * Handle the failure of a hook ('beforeAll' or 'afterAll').
   */
  private handleHookFailure(hookName: string, error: any): void {
    Log.error(`'${hookName}' failed: ${error.message}`);

    this.suiteCase.reports.push({
      id: -1, // No specific test associated with hook failures
      description: `Suite ${hookName}`,
      error: new TestError({
        description: `Suite ${hookName}`,
        message: error.message,
        stack: error.stack,
      }),
      duration: 0,
    });
  }

  /**
   * Set the duration of a test, whether it passed or failed.
   */
  private setTestDuration(
    id: number,
    description: string,
    startTime: number,
  ): void {
    const testEndTime = Date.now();
    const testDuration = testEndTime - startTime;

    const report = this.suiteCase.reports.find((report) => report.id === id);
    if (report) {
      report.duration = testDuration;
    } else {
      this.suiteCase.reports.push({
        id,
        description,
        duration: testDuration,
      });
    }
  }
}
