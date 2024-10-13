/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import { Log } from "../utils/Log";
import { SuiteCase } from "../types";
import { RuntimeError } from "../runtime/RuntimeError";
import { Suite } from "../framework/Suite";
import { TestRunner } from "./TestRunner";

export class SuiteRunner {
  private suiteCase: SuiteCase = {} as SuiteCase;
  private failedTestIndexes: Set<number> = new Set(); // Track failed tests by their index
  private hasHookFailure: boolean = false;
  
  /**
   * Public method to run the entire suite inside a VirtualRuntime.
   */
  async runSuite(suiteCase: SuiteCase): Promise<void> {
    this.suiteCase = suiteCase;
    const suite = this.suiteCase.suite;

    Log.info(`Executing suite: ${suite.description}`);

    // Run 'beforeAll' hook
    await this.runBeforeAll(suite);

    // Delegate the execution of all tests to TestRunner
    const testRunner = new TestRunner(this.suiteCase, this.failedTestIndexes);
    await testRunner.runAllTests(suite);

    // Run 'afterAll' hook
    await this.runAfterAll(suite);

    // Set the final suite status
    this.suiteCase.status =
      this.hasHookFailure ? "failed" :
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
      error: new RuntimeError({
        description: `Suite ${hookName}`,
        message: error.message,
        stack: error.stack,
      }),
      status: "failed", // Mark the status as failed
      duration: 0,
    });
    this.hasHookFailure = true;
  }
}
