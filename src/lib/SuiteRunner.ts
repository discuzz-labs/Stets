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
    this.suiteCase.status = this.failedTestIndexes.size > 0 ? "failed" : "success";
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
      const metadata = suite.testMetadata.get(id) || { index: id };

      // Skip ignored tests
      if (metadata.ignore) {
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

      // Resolve test dependencies by tag
      if (metadata.dependsOn) {
        const dependentTestIndex = this.getTestIndexByTag(suite, metadata.dependsOn);

        if (dependentTestIndex === -1) {
          Log.warning(`Test "${test.description}" skipped because dependency tag "${metadata.dependsOn}" was not found.`);
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
          Log.warning(`Test "${test.description}" skipped because dependency "${metadata.dependsOn}" (Test #${dependentTestIndex}) has not been executed.`);
          continue;
        }
      }

      await this.runTest(suite, test, metadata);
      executedTests.add(id); // Mark test as executed by its index
    }
  }

  /**
   * Run an individual test case.
   */
  private async runTest(
    suite: Suite,
    test: Test,
    metadata: TestMetadata,
  ): Promise<void> {
    const testStartTime = Date.now();

    try {
      Log.info(`Running test: ${test.description}`);

      // Fetch the latest metadata before executing the test
      let updatedMetadata = suite.testMetadata.get(metadata.index) || metadata;

      suite.currentTestIndex = updatedMetadata.index;

      // Run the beforeEach hook with the updated metadata
      await suite.beforeEachFn(suite, updatedMetadata);

      // Run the preRun function if it exists in the metadata
      if (updatedMetadata.preRun) {
        await updatedMetadata.preRun(suite, updatedMetadata);
      }

      // Run the actual test function
      await test.fn(suite, updatedMetadata, (updates: Partial<TestMetadata>) => {
        // Update the metadata dynamically during the test execution
        Object.assign(updatedMetadata, updates);
        suite.testMetadata.set(metadata.index, updatedMetadata);
      });

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

    } catch (error: any) {
      // Handle test failure
      this.handleTestFailure(test, metadata, error);
    } finally {
      // Ensure test duration is set regardless of success or failure
      this.setTestDuration(metadata.index, test.description, testStartTime);
    }
  }



  /**
   * Handle the failure of a test case.
   */
  private handleTestFailure(test: Test, metadata: TestMetadata, error: any): void {
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
   * Get the index of a test by its tag.
   * Returns -1 if the tag is not found.
   */
  private getTestIndexByTag(suite: Suite, tag: string): number {
    for (let i = 0; i < suite.tests.length; i++) {
      const metadata = suite.testMetadata.get(i);
      if (metadata?.tag === tag) {
        return i;
      }
    }
    return -1; // Tag not found
  }
}