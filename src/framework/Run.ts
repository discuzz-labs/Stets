/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

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

  // Define a common interface for Test and Hook
  private async execute(
    executable: Test | Hook,
  ): Promise<TestResult | HookResult> {
    const description = executable.description;
    const fn = executable.fn;
    const timeout = executable.options.timeout;

    const result: TestResult | HookResult = {
      description,
      status: executable.options.skip ? "skipped" : "passed",
    };

    if (executable.options.skip) return result;

    const controller = new AbortController();
    const timeoutId =
      timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;

    try {
      await Promise.race([
        fn(),
        new Promise((_, reject) =>
          controller.signal.addEventListener("abort", () =>
            reject(new Error(`${description} exceeded ${timeout} ms.`)),
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
        failed: 0,
        skipped: 0,
      },
      passed: true,
      description: this.testCase.description,
      tests: [],
      hooks: [],
    };

    // Run beforeAll hooks
    if (this.testCase.hooks.beforeAll) {
      const beforeAllResult = await this.execute(this.testCase.hooks.beforeAll);
      report.hooks.push(beforeAllResult as HookResult);
    }

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
          // Run beforeEach hook
          if (this.testCase.hooks.beforeEach) {
            const beforeEachResult = await this.execute(
              this.testCase.hooks.beforeEach,
            );
            report.hooks.push(beforeEachResult as HookResult);
          }

          const result = (await this.execute(test)) as TestResult;
          report.tests.push(result);

          // Run afterEach hook
          if (this.testCase.hooks.afterEach) {
            const afterEachResult = await this.execute(
              this.testCase.hooks.afterEach,
            );
            report.hooks.push(afterEachResult as HookResult);
          }

          return result;
        }),
      );

      for (const result of results) {
        if (result.status === "passed") {
          report.stats.passed++;
        } else if (result.status === "skipped") {
          report.stats.skipped++;
        } else {
          report.stats.failed++;
          report.passed = false;
        }
      }
    }

    // Run afterAll hooks
    if (this.testCase.hooks.afterAll) {
      const afterAllResult = await this.execute(this.testCase.hooks.afterAll);
      report.hooks.push(afterAllResult as HookResult);
    }

    return report;
  }
}

export default Run;
