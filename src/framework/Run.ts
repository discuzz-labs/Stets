import type Suite from "./Suite";
import type { Hook, HookResult, SuiteReport, Test, TestResult } from "./Suite";

export default class Run {
  constructor(private suite: Suite) {}

  private async executeTest(test: Test): Promise<TestResult> {
    const result: TestResult = {
      description: test.description,
      status: "passed",
    };

    try {
      await this.withTimeout(test.fn(), test.timeout, test.description);
    } catch (error: any) {
      result.status = "failed";
      result.error = { message: error.message, stack: error.stack };
    }
    return result;
  }

  private async executeHook(hook: Hook): Promise<HookResult> {
    const result: HookResult = {
      description: hook.description,
      status: "passed",
    };
    try {
      await this.withTimeout(hook.fn(), hook.timeout, hook.description);
    } catch (error: any) {
      result.status = "failed";
      result.error = { message: error.message, stack: error.stack };
    }
    return result;
  }

  private timeout(ms: number, description: string): Promise<void> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${description} exceeded ${ms} ms.`)),
        ms,
      ),
    );
  }

  private withTimeout(
    promise: Promise<void> | void,
    ms: number,
    description: string,
  ) {
    return ms > 0
      ? Promise.race([promise, this.timeout(ms, description)])
      : Promise.resolve(promise);
  }

  // Method to execute all hooks for a specific type
  private async executeHooks(hookType: "beforeAll" | "afterAll" | "beforeEach" | "afterEach"): Promise<void> {
    // Run parent's hooks first
    if (this.suite.parent) {
      await new Run(this.suite.parent).executeHooks(hookType);
    }

    const hooksToExecute = this.suite.hooks.filter(
      (hook) => hook.description === hookType
    );
    for (const hook of hooksToExecute) {
      await this.executeHook(hook);
    }
  }

  async run(): Promise<SuiteReport> {
    const report: SuiteReport = {
      passed: true,
      description: this.suite.description,
      metrics: { passed: 0, failed: 0, skipped: 0 },
      tests: [],
      hooks: [],
      children: [],
    };

    // Execute beforeAll hooks
    await this.executeHooks("beforeAll");

    // Execute each test with beforeEach and afterEach hooks
    for (const test of this.suite.tests) {
      await this.executeHooks("beforeEach");

      // Execute the test and store its result
      const result = await this.executeTest(test);
      report.tests.push(result);
      report.metrics[result.status]++;
      if (result.status === "failed") {
        report.passed = false;
      }

      await this.executeHooks("afterEach");
    }

    // Run child suites
    for (const child of this.suite.children) {
      const childReport = await child.run();
      report.children.push(childReport);
      if (!childReport.passed) {
        report.passed = false;
      }
    }

    // Execute afterAll hooks
    await this.executeHooks("afterAll");

    return report;
  }
}
