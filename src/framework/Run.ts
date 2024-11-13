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
  private readonly MAX_TIMEOUT = 300_000; // 5 minutes

  constructor(private testCase: TestCase) {}

  // Define a common interface for Test and Hook
  private async execute(
    executable: Test | Hook,
  ): Promise<TestResult | HookResult> {
    const { description, fn, options } = executable;
    const { timeout, skip, if: condition, softFail, retry } = options;

    const result: TestResult | HookResult = {
      description,
      retries: 0,
      status: "passed",
    };

    if (
      skip ||
      condition === undefined ||
      condition === null ||
      !(await this.evaluateCondition(condition))
    ) {
      result.status = "skipped";
      return result;
    }

    let lastError: any;
    const fallbackTimeout = timeout === 0 ? this.MAX_TIMEOUT : timeout;

    while (result.retries <= retry) {
      try {
        await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    `${description} exceeded ${fallbackTimeout} ms. ${fallbackTimeout === this.MAX_TIMEOUT ? "Fallback timeout was used. This test took 5 minutes to finish. Make sure you donot have any dead promises! Finding dead promises: https://swizec.com/blog/finding-unresolved-promises-in-javascript/" : ""} `,
                  ),
                ),
              fallbackTimeout,
            ),
          ),
        ]);

        // If it succeeds, we exit the loop with a passed result
        return result;
      } catch (error: any) {
        lastError = error; // Keep track of the last error
        result.retries++;

        // If softFail is set and this was the last attempt, mark as "soft-fail"
        if (result.retries > retry) {
          if (softFail) {
            result.status = "soft-fail";
            result.error = {
              message: `Soft failure: ${lastError.message}`,
              stack: lastError.stack,
            };
          } else {
            result.status = "failed";
            result.error = {
              message: lastError.message,
              stack: lastError.stack,
            };
          }
          return result;
        }
      }
    }

    return result;
  }

  private async evaluateCondition(
    condition: boolean | (() => boolean | Promise<boolean> | null | undefined),
  ): Promise<boolean> {
    if (typeof condition === "function") {
      return (await condition()) ?? false;
    }
    return condition ?? true;
  }

  // Run all tests and hooks in the TestCase
  async run(): Promise<TestReport> {
    const report: TestReport = {
      stats: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        softFailed: 0,
      },
      status: "passed",
      description: this.testCase.description,
      tests: [],
      hooks: [],
    };

    // Run beforeAll hooks
    if (this.testCase.hooks.beforeAll) {
      const beforeAllResult = await this.execute(this.testCase.hooks.beforeAll);
      report.hooks.push(beforeAllResult as HookResult);
    }

    // Determine if there are any `only` tests
    const hasOnlyTests =
      this.testCase.onlyTests.length > 0 ||
      this.testCase.sequenceOnlyTests.length > 0;

    // Set the tests to run based on `only` or regular tests
    const testsToRun = hasOnlyTests
      ? this.testCase.onlyTests
      : this.testCase.tests;

    const sequenceTestsToRun = hasOnlyTests
      ? this.testCase.sequenceOnlyTests
      : this.testCase.sequenceTests;

    // Update total count to include all tests, including those that will be skipped
    report.stats.total =
      this.testCase.tests.length +
      this.testCase.sequenceTests.length +
      this.testCase.onlyTests.length +
      this.testCase.sequenceOnlyTests.length;

    // Mark tests as skipped if they are not part of the `only` group
    const allTests = [...this.testCase.tests, ...this.testCase.sequenceTests];
    for (const test of allTests) {
      if (!testsToRun.includes(test) && !sequenceTestsToRun.includes(test)) {
        report.tests.push({
          description: test.description,
          status: "skipped",
        } as TestResult);
        report.stats.skipped++;
      }
    }

    // Run tests in parallel batches
    for (let i = 0; i < testsToRun.length; i += this.MAX_PARALLEL_TESTS) {
      const batch = testsToRun.slice(i, i + this.MAX_PARALLEL_TESTS);

      const results = await Promise.all(
        batch.map(async (test) => {
          if (this.testCase.hooks.beforeEach) {
            const beforeEachResult = await this.execute(
              this.testCase.hooks.beforeEach,
            );
            report.hooks.push(beforeEachResult as HookResult);
          }

          const result = (await this.execute(test)) as TestResult;
          report.tests.push(result);

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
        } else if (result.status === "soft-fail") {
          report.stats.softFailed++;
        } else if (result.status === "failed") {
          report.stats.failed++;
          report.status = "failed";
        }
      }
    }

    // Run sequential tests
    for (const test of sequenceTestsToRun) {
      if (this.testCase.hooks.beforeEach) {
        const beforeEachResult = await this.execute(
          this.testCase.hooks.beforeEach,
        );
        report.hooks.push(beforeEachResult as HookResult);
      }

      const result = (await this.execute(test)) as TestResult;
      report.tests.push(result);

      if (result.status === "passed") {
        report.stats.passed++;
      } else if (result.status === "soft-fail") {
        report.stats.softFailed++;
      } else if (result.status === "failed") {
        report.stats.failed++;
        report.status = "failed";
      }

      if (this.testCase.hooks.afterEach) {
        const afterEachResult = await this.execute(
          this.testCase.hooks.afterEach,
        );
        report.hooks.push(afterEachResult as HookResult);
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
