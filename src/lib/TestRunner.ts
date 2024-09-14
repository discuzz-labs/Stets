/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Test } from "../lib/Test";
import { glob } from 'glob';
import { Log } from "../lib/Log";
import execShellCommand from "../utils/execShellCommand";

export class TestRunner {
  private tests: Test[] = [];

  constructor() {}

  /**
   * Loads all test files matching the pattern and initializes Test instances.
   */
  async loadTests() {
    // This will be using Config file in the future
    const testFiles = await glob("**/*.test.ts", { ignore: 'node_modules/**' });
    this.tests = testFiles.map(file => new Test(file));
  }

  /**
   * Runs all loaded tests in parallel and logs the results.
   */
  async runTests() {
    await Promise.all(
      this.tests.map(async (test) => await this.runTest(test))
    );

    // Clear console for feedback
    console.clear();

    this.tests.forEach(test => {
      Log.logTestResult(test.path, test.status, test.duration);
      if(test.status === 'failed') {
        console.log(test.error)
      }
    });

    const failedTests = this.tests.filter(test => test.status === 'failed').length;
    
    Log.logSummary(this.tests.length, failedTests);

    process.exit(failedTests > 0 ? 1 : 0);
  }

  /**
   * Runs a single test and updates its status based on the result.
   * @param test {Test} - The test instance to run.
   */
  private async runTest(test: Test) {
    Log.logTestStart(test.path); // Log test start
    test.start(); // Record the start time

    try {
      // Run the test using execShellCommand
      await execShellCommand(["tsx", test.path, "--enable-source-maps"]);
      test.pass(); // Mark the test as passed
    } catch (error) {
      test.fail(error as Error); // Mark the test as failed
    }
  }
}