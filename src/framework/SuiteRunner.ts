import type { HookResult, SuiteReport, TestResult } from "../types";
import type { Hook, Suite, Test } from "./Suite";

export class SuiteRunner {
  private suite: Suite;
  private suiteReport: SuiteReport;

  constructor(suite: Suite) {
      this.suite = suite;
      this.suiteReport = {
          description: suite.description,
          duration: 0,
          result: {
              passed: true,
              tests: [],
              hooks: [],
          },
          children: [],
          error: { message: null, stack: null },
      };
  }

  /**
   * Run all hooks (beforeAll) for the suite.
   */
  private async runHooks(): Promise<void> {
      for (const hook of this.suite.hooks) {
          const hookResult = await this.executeHook(hook);
          this.suiteReport.result.hooks.push(hookResult);

          if (!hookResult.passed) {
              this.suiteReport.result.passed = false;
          }
      }
  }

  /**
   * Executes a single hook and handles errors.
   * @param hook - The hook function to execute.
   * @returns The result of the hook execution.
   */
  private async executeHook(hook: Hook): Promise<HookResult> {
      let hookResult: HookResult = {
          type: hook.type,
          passed: true,
          error: { message: null, stack: null },
      };

      try {
          await hook.fn();
      } catch (error: any) {
          hookResult.passed = false;
          hookResult.error = {
              message: error.message,
              stack: error.stack,
          };
      }

      return hookResult;
  }

  /**
   * Run all tests in the suite.
   */
  private async runTests(): Promise<void> {
      for (const test of this.suite.tests) {
          const testResult = await this.executeTest(test);
          this.suiteReport.result.tests.push(testResult);

          if (!testResult.passed) {
              this.suiteReport.result.passed = false;
          }
      }
  }

  /**
   * Executes a single test and handles errors.
   * @param test - The test function to execute.
   * @returns The result of the test execution.
   */
  private async executeTest(test: Test): Promise<TestResult> {
      let testResult: TestResult = {
          description: test.description,
          passed: true,
          error: { message: null, stack: null },
      };

      try {
          await test.fn();
      } catch (error: any) {
          testResult.passed = false;
          testResult.error = {
              message: error.message,
              stack: error.stack,
          };
      }

      return testResult;
  }

  /**
   * Run all child suites recursively.
   */
  private async runChildSuites(): Promise<void> {
      for (const childSuite of this.suite.children) {
          const childRunner = new SuiteRunner(childSuite);
          const childResult = await childRunner.run();
          this.suiteReport.children.push(childResult);

          if (!childResult.result.passed) {
              this.suiteReport.result.passed = false;
          }
      }
  }

  /**
   * Run the entire suite (hooks, tests, and child suites), and return the result.
   */
  public async run(): Promise<SuiteReport> {
      const startTime = Date.now();

      try {
          // Run hooks, tests, and child suites
          await this.runHooks();
          await this.runTests();
          await this.runChildSuites();
      } catch (error: any) {
          this.suiteReport.error = {
              message: error.message,
              stack: error.stack,
          };
      } finally {
          // Set the duration for the suite run
          this.suiteReport.duration = Date.now() - startTime;
      }

      return this.suiteReport;
  }
}