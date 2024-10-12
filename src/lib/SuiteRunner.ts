/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Suite } from "../framework/Suite";
import { SuiteCase, Test, TestMetadata } from "../types";
import { Log } from "../utils/Log";
import { TestError } from "./TestError";

export class SuiteRunner {
  private suiteCase: SuiteCase;
  private failedTestIndexes: Set<number>; // Track failed tests by their index

  constructor(suiteCase: SuiteCase) {
    this.suiteCase = suiteCase;
    this.failedTestIndexes = new Set<number>(); // Initialize the failed test set
  }

  /**
   * Public method to run the entire suite.
   */
  async runSuite(): Promise<void> {
    const suite = this.suiteCase.suite;

    Log.info(`Executing suite: ${suite.description}`);

    // Run 'beforeAll' hook
    await this.runBeforeAll(suite);

    // Execute all tests in the suite
    await this.runAllTests(suite);

    // Run 'afterAll' hook
    await this.runAfterAll(suite);

    // Set the final suite status
    this.suiteCase.status =
      this.failedTestIndexes.size > 0 ? "failed" : "success";
  }

  private async runBeforeAll(suite: Suite): Promise<void> {
    try {
      Log.info(`Executing 'beforeAll' for suite: ${suite.description}`);
      await suite.beforeAllFn(suite);
    } catch (error: any) {
      this.handleHookFailure("beforeAll", error);
    }
  }

  private async runAfterAll(suite: Suite): Promise<void> {
    try {
      Log.info(`Executing 'afterAll' for suite: ${suite.description}`);
      await suite.afterAllFn(suite);
    } catch (error: any) {
      this.handleHookFailure("afterAll", error);
    }
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
      status: "failed", // Mark the status as failed
      duration: 0,
    });
  }

  private async runAllTests(suite: Suite): Promise<void> {
    const executedTests = new Set<number>(); // Track executed tests by index

    for (let id = 0; id < suite.tests.length; id++) {
      const test = suite.tests[id];
      const metadata =
        suite.testMetadata.get(id) ||
        ({ index: id, retry: 1, timeout: 5000 } as TestMetadata);

      // Skip ignored tests
      if (metadata?.ignore) {
        Log.info(`Test ignored: ${test.description}`);

        // Add a report with the status "ignored"
        this.suiteCase.reports.push({
          id,
          description: test.description,
          status: "ignored",
          duration: 0, // Ignored tests don't have a duration
        });

        continue;
      }

      // Resolve test dependencies by name
      if (metadata?.dependsOn) {
        const dependentTestIndex = this.getTestIndexByname(
          suite,
          metadata.dependsOn,
        );

        if (dependentTestIndex === -1) {
          Log.warning(
            `Test "${test.description}" skipped because dependency name "${metadata.dependsOn}" was not found.`,
          );
          continue;
        }

        // Check if the dependent test failed
        if (this.failedTestIndexes.has(dependentTestIndex)) {
          const message = `Skipping test "${test.description}" because dependency "${metadata.dependsOn}" (Test #${dependentTestIndex}) failed.`;
          Log.warning(message);
          this.handleTestFailure(test, metadata, new Error(message)); // Fail the dependent test
          continue;
        }

        // Check if the dependent test has not yet been executed
        if (!executedTests.has(dependentTestIndex)) {
          Log.warning(
            `Test "${test.description}" skipped because dependency "${metadata.dependsOn}" (Test #${dependentTestIndex}) has not been executed.`,
          );
          continue;
        }
      }

      await this.runTest(suite, test, metadata);
      executedTests.add(id); // Mark test as executed by its index
    }
  }

  private async runTest(
    suite: Suite,
    test: Test,
    metadata: TestMetadata,
  ): Promise<void> {
    const testStartTime = Date.now();
    const maxRetries = metadata.retry || 0; // Set max retries from metadata or default to 0 (no retries)
    let attempt = 0;
    let lastError: any;

    while (attempt <= maxRetries) {
      try {
        attempt++;
        Log.info(`Running test: ${test.description} (Attempt ${attempt})`);

        // Fetch the latest metadata before executing the test
        let updatedMetadata = suite.testMetadata.get(metadata.index) || metadata;

        suite.currentTestIndex = updatedMetadata.index;

        // Run the beforeEach hook with the updated metadata
        await suite.beforeEachFn(suite, updatedMetadata);

        // Run the preRun function if it exists in the metadata
        if (updatedMetadata.preRun) {
          await updatedMetadata.preRun(suite, updatedMetadata);
        }

        // Run the actual test function with timeout
        await this.runWithTimeout(
          test.fn(suite, updatedMetadata, (updates: Partial<TestMetadata>) => {
            // Update the metadata dynamically during the test execution
            Object.assign(updatedMetadata, updates);
            suite.testMetadata.set(metadata.index, updatedMetadata);
          }),
          updatedMetadata.timeout || 10000,
        );

        // Run the postRun function if it exists in the metadata
        if (updatedMetadata.postRun) {
          await updatedMetadata.postRun(suite, updatedMetadata);
        }

        // Run the afterEach hook with the updated metadata
        await suite.afterEachFn(suite, updatedMetadata);

        // Report success
        this.suiteCase.reports.push({
          id: updatedMetadata.index,
          description: test.description,
          status: metadata.ignore ? "ignored" : "success",
          duration: Date.now() - testStartTime,
        });

        // If test passes, break the retry loop
        break;
      } catch (error: any) {
        lastError = error;
        if (attempt > maxRetries) {
          // If retries are exhausted, handle failure
          this.handleTestFailure(test, metadata, error);
          break;
        } else {
          // If retry is needed, log it and wait before the next attempt
          Log.warning(`Test failed on attempt ${attempt}. Retrying...`);
          await this.handleRetryDelay(metadata.retryDelay || 1000); // Optional delay between retries (defaults to 1000ms)
        }
      } finally {
        // Ensure test duration is set regardless of success or failure
        this.setTestDuration(metadata.index, test.description, testStartTime);
      }
    }
  }

  /**
   * Handles a delay between retries.
   * @param delay The delay in milliseconds.
   */
  private async handleRetryDelay(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Runs a promise with a timeout.
   */
  private async runWithTimeout(
    promise: Promise<any>,
    timeout: number,
  ): Promise<any> {
    if (timeout <= 0) {
      return promise;
    }

    let timer: any;

    return Promise.race([
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Test timed out")), timeout);
      }),
      promise.then((value) => {
        clearTimeout(timer);
        return value;
      }),
    ]);
  }


  /**
   * Handle the failure of a test case.
   */
  private handleTestFailure(
    test: Test,
    metadata: TestMetadata,
    error: any,
  ): void {
    const testError = new TestError({
      description: test.description,
      message: error.message,
      stack: error.stack,
    });

    Log.error(`Test failed: ${test.description}, ${error}`);

    this.suiteCase.reports.push({
      id: metadata.index,
      status: "failed",
      description: test.description,
      error: testError,
      duration: -1, // Mark as -1 on failure, but it will be overwritten by the final duration
    });

    // Mark this test as failed by index
    this.failedTestIndexes.add(metadata.index);
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
    }

    Log.info(`Test completed: ${description}, Duration: ${testDuration}ms`);
  }

  /**
   * Get the index of a test by its name.
   * Returns -1 if the name is not found.
   */
  private getTestIndexByname(suite: Suite, name: string): number {
    for (let i = 0; i < suite.tests.length; i++) {
      const metadata = suite.testMetadata.get(i);
      if (metadata?.name === name) {
        return i;
      }
    }
    return -1; // name not found
  }
}
