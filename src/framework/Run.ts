import type {
  Hook,
  HookResult,
  Test,
  TestResult,
  TestReport,
} from "./TestCase";
import TestCase from "./TestCase";
import { cpus } from "os";

class Run {
  private readonly MAX_PARALLEL_TESTS = cpus().length || 4;

  constructor(private testCase: TestCase) {}

  // Execute a single test
  private async executeTest(test: Test): Promise<TestResult> {

    if (test.skipped)
      return {
        description: test.description,
        status: "skipped",
      };

    const result: TestResult = {
      description: test.description,
      status: "passed",
    };

    
    const controller = new AbortController();
    const timeoutId =
      test.timeout > 0
        ? setTimeout(() => controller.abort(), test.timeout)
        : null;

    try {
      await Promise.race([
        test.fn(),
        new Promise((_, reject) =>
          controller.signal.addEventListener("abort", () =>
            reject(
              new Error(`${test.description} exceeded ${test.timeout} ms.`),
            ),
          ),
        ),
      ]);
    } catch (error: any) {
      result.status = "failed";
      result.error = { message: error.message, stack: error.stack };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    return result;
  }

  // Execute a single hook
  private async executeHook(hook: Hook): Promise<HookResult> {
    const result: HookResult = {
      description: hook.description,
      status: "passed",
    };

    const controller = new AbortController();
    const timeoutId =
      hook.timeout > 0
        ? setTimeout(() => controller.abort(), hook.timeout)
        : null;

    try {
      await Promise.race([
        hook.fn(),
        new Promise((_, reject) =>
          controller.signal.addEventListener("abort", () =>
            reject(
              new Error(`${hook.description} exceeded ${hook.timeout} ms.`),
            ),
          ),
        ),
      ]);
    } catch (error: any) {
      result.status = "failed";
      result.error = { message: error.message, stack: error.stack };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    return result;
  }

  // Run all tests and hooks in the TestCase
  async run(): Promise<TestReport> {
    const report: TestReport = {
      stats: {
        total: 0,
        passed: 0,
        failures: 0,
        skipped: 0,
      },
      passed: true,
      description: this.testCase.description,
      tests: [],
      hooks: [],
    };

    // Run beforeAll hooks
    this.testCase.hooks.beforeAll
      ? await this.executeHook(this.testCase.hooks.beforeAll)
      : null;

    // Determine which tests to run: onlyTests or all tests
    const testsToRun =
      this.testCase.onlyTests.length > 0
        ? this.testCase.onlyTests
        : this.testCase.tests;

    report.stats.total = testsToRun.length;

    // Run tests in batches for parallelization
    for (let i = 0; i < testsToRun.length; i += this.MAX_PARALLEL_TESTS) {
      const batch = testsToRun.slice(i, i + this.MAX_PARALLEL_TESTS);

      const results = await Promise.all(
        batch.map(async (test) => {
          this.testCase.hooks.beforeEach
            ? await this.executeHook(this.testCase.hooks.beforeEach)
            : null;

          const result = await this.executeTest(test);
          this.testCase.hooks.afterEach
            ? await this.executeHook(this.testCase.hooks.afterEach)
            : null;

          return result;
        }),
      );

      for (const result of results) {
        report.tests.push(result);
        if (result.status === "passed") {
          report.stats.passed++;
        } else if (result.status === "skipped") {
            report.stats.skipped++;
        } else {
          report.stats.failures++;
          report.passed = false;
        }
      }
    }

    // Run afterAll hooks
    this.testCase.hooks.afterEach
      ? await this.executeHook(this.testCase.hooks.afterEach)
      : null;

    return report;
  }
}

export default Run;
