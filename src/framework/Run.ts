import type Suite from "./Suite";
import type { Hook, HookResult, SuiteReport, Test, TestResult } from "./Suite";
import { cpus } from "os"

export default class Run {
  private hookCache: Map<string, Promise<void>> = new Map();
  private readonly MAX_PARALLEL_TESTS = cpus.length || 4;

  constructor(private suite: Suite){}

  private async executeTest(test: Test): Promise<TestResult> {
    const result: TestResult = {
      description: test.description,
      status: "passed",
    };

    try {
      // Use AbortController for more efficient timeout handling
      const controller = new AbortController();
      const timeoutId = test.timeout > 0 
        ? setTimeout(() => controller.abort(), test.timeout)
        : null;

      try {
        await Promise.race([
          test.fn(),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => 
              reject(new Error(`${test.description} exceeded ${test.timeout} ms.`))
            );
          })
        ]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    } catch (error: any) {
      result.status = "failed";
      result.error = { 
        message: error.message, 
        stack: error.stack 
      };
    }

    return result;
  }

  private async executeHook(hook: Hook): Promise<HookResult> {
    const result: HookResult = {
      description: hook.description,
      status: "passed",
    };

    try {
      const controller = new AbortController();
      const timeoutId = hook.timeout > 0
        ? setTimeout(() => controller.abort(), hook.timeout)
        : null;

      try {
        await Promise.race([
          hook.fn(),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => 
              reject(new Error(`${hook.description} exceeded ${hook.timeout} ms.`))
            );
          })
        ]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    } catch (error: any) {
      result.status = "failed";
      result.error = { 
        message: error.message, 
        stack: error.stack 
      };
    }

    return result;
  }

  private async executeHooks(hookType: "beforeAll" | "afterAll" | "beforeEach" | "afterEach"): Promise<void> {
    // Use cached result for parent hooks if available
    if (this.suite.parent) {
      const parentCacheKey = `${this.suite.parent.description}-${hookType}`;
      if (!this.hookCache.has(parentCacheKey)) {
        this.hookCache.set(
          parentCacheKey,
          new Run(this.suite.parent).executeHooks(hookType)
        );
      }
      await this.hookCache.get(parentCacheKey);
    }

    // Execute current suite's hooks
    const hooksToExecute = this.suite.hooks.filter(
      (hook) => hook.description === hookType
    );

    // Parallelize hook execution when possible
    if (hookType === "beforeAll" || hookType === "afterAll") {
      await Promise.all(hooksToExecute.map(hook => this.executeHook(hook)));
    } else {
      for (const hook of hooksToExecute) {
        await this.executeHook(hook);
      }
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

    // Handle only mode suites
    const onlySuites = this.suite.children.filter(child => child.onlyMode);
    if (onlySuites.length > 0) {
      await Promise.all(
        onlySuites.map(async (onlySuite) => {
          const onlySuiteReport = await onlySuite.run();
          report.children.push(onlySuiteReport);
          if (!onlySuiteReport.passed) report.passed = false;
        })
      );
      return report;
    }

    await this.executeHooks("beforeAll");

    // Parallelize test execution with controlled concurrency
    const testsToRun = this.suite.onlyTests.length !== 0 ? 
      this.suite.onlyTests : 
      this.suite.tests;

    // Process tests in batches for controlled parallelization
    for (let i = 0; i < testsToRun.length; i += this.MAX_PARALLEL_TESTS) {
      const batch = testsToRun.slice(i, i + this.MAX_PARALLEL_TESTS);
      const results = await Promise.all(
        batch.map(async (test) => {
          await this.executeHooks("beforeEach");
          const result = await this.executeTest(test);
          await this.executeHooks("afterEach");
          return result;
        })
      );

      results.forEach(result => {
        report.tests.push(result);
        report.metrics[result.status]++;
        if (result.status === "failed") report.passed = false;
      });
    }

    // Parallelize child suite execution
    await Promise.all(
      this.suite.children.map(async (child) => {
        const childReport = await child.run();
        report.children.push(childReport);
        if (!childReport.passed) report.passed = false;
      })
    );

    await this.executeHooks("afterAll");
    return report;
  }
}