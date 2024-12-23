/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Bench } from "../core/Bench.js";
import type {
  Hook,
  HookResult,
  Test,
  TestResult,
  TestReport,
} from "./TestCase.js";
import TestCase from "./TestCase.js";
import { cpus } from "os";

class RunTime {
  private readonly MAX_PARALLEL_TESTS = cpus().length || 4;

  constructor(private testCase: TestCase) {}

  private async execute(
    executable: Test | Hook,
  ): Promise<TestResult | HookResult> {
    const { description, fn, options } = executable;
    const {
      timeout,
      skip,
      if: condition,
      softfail,
      retry,
      bench,
      todo,
      warmup,
      iterations,
      confidence,
    } = options;

    const result: TestResult | HookResult = {
      description,
      retries: 0,
      status: "passed",
      duration: 0,
      bench: null,
    };

    if (todo) {
      result.status = "todo";
      return result;
    }

    if (
      skip ||
      condition === undefined ||
      condition === null ||
      !(await this.evaluateCondition(condition))
    ) {
      result.status = "skipped";
      return result;
    }

    const start = Date.now();

    let lastError: any;

    while (result.retries <= retry) {
      try {
        // Attempt the test
        await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`${description} exceeded ${timeout} ms.`)),
              timeout,
            ),
          ),
        ]);
        // If successful, exit the loop
        result.status = "passed";
        break;
      } catch (error: any) {
        lastError = error;

        // Increment retries only if it's less than allowed retries
        if (result.retries < retry) {
          result.retries++;
        } else {
          // Set status and error after retries are exhausted
          result.status = softfail ? "softfailed" : "failed";
          result.error = {
            message: lastError.message,
            stack: lastError.stack,
          };
          break;
        }
      } finally {
        // Update the duration after all attempts
        result.duration = parseInt((Date.now() - start).toFixed(4));
      }
    }
    // Handle benchmarking if applicable
    if (bench) {
      result.bench = await Bench.run(fn, {
        warmup,
        iterations,
        confidence,
        timeout,
      });
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

  private async runHook(hook: Hook | undefined): Promise<HookResult | null> {
    if (hook) {
      return (await this.execute(hook)) as HookResult;
    }
    return null;
  }

  private determineTestsToRun() {
    const hasOnlyTests =
      this.testCase.onlyTests.length > 0 ||
      this.testCase.sequenceOnlyTests.length > 0;

    const testsToRun = hasOnlyTests
      ? this.testCase.onlyTests
      : this.testCase.tests;

    const sequenceTestsToRun = hasOnlyTests
      ? this.testCase.sequenceOnlyTests
      : this.testCase.sequenceTests;

    // Combine all tests
    const allTests = [
      ...this.testCase.tests,
      ...this.testCase.sequenceTests,
      ...this.testCase.onlyTests,
      ...this.testCase.sequenceOnlyTests,
    ];

    // Find excluded tests
    const includedTests = [...testsToRun, ...sequenceTestsToRun];
    const excludedTests: TestResult[] = allTests
      .filter((test) => !includedTests.includes(test))
      .map((test) => ({
        description: test.description,
        status: "skipped",
        retries: 0,
        duration: 0,
        bench: null,
      }));

    return { testsToRun, sequenceTestsToRun, excludedTests };
  }

  private async runSingleTest(test: Test): Promise<{
    beforeEach: HookResult | null;
    testResult: TestResult;
    afterEach: HookResult | null;
  }> {
    const beforeEachResult = await this.runHook(this.testCase.hooks.beforeEach);
    const testResult = (await this.execute(test)) as TestResult;
    const afterEachResult = await this.runHook(this.testCase.hooks.afterEach);

    if (beforeEachResult && testResult)
      beforeEachResult.description += ` for ${testResult.description}`;

    return {
      beforeEach: beforeEachResult,
      testResult,
      afterEach: afterEachResult,
    };
  }

  private async runTestsInParallel(testsToRun: Test[]): Promise<
    {
      beforeEach: HookResult | null;
      testResult: TestResult;
      afterEach: HookResult | null;
    }[]
  > {
    const results: {
      beforeEach: HookResult | null;
      testResult: TestResult;
      afterEach: HookResult | null;
    }[] = [];
    for (let i = 0; i < testsToRun.length; i += this.MAX_PARALLEL_TESTS) {
      const batch = testsToRun.slice(i, i + this.MAX_PARALLEL_TESTS);
      const batchResults = await Promise.all(
        batch.map((test) => this.runSingleTest(test)),
      );
      results.push(...batchResults);
    }
    return results;
  }

  private async runTestsInSequence(testsToRun: Test[]): Promise<
    {
      beforeEach: HookResult | null;
      testResult: TestResult;
      afterEach: HookResult | null;
    }[]
  > {
    const results: {
      beforeEach: HookResult | null;
      testResult: TestResult;
      afterEach: HookResult | null;
    }[] = [];
    for (const test of testsToRun) {
      const result = await this.runSingleTest(test);
      results.push(result);
    }
    return results;
  }

  async run(): Promise<TestReport> {
    const { testsToRun, sequenceTestsToRun, excludedTests } =
      this.determineTestsToRun();

    const total =
      this.testCase.onlyTests.length +
      this.testCase.sequenceOnlyTests.length +
      this.testCase.tests.length +
      this.testCase.sequenceTests.length;
    const report: TestReport = {
      stats: {
        total,
        passed: 0,
        failed: 0,
        skipped: 0,
        softfailed: 0,
        todo: 0,
      },
      status: "passed",
      description: this.testCase.description,
      tests: [...excludedTests],
      hooks: [],
    };

    const beforeAllResult = await this.runHook(this.testCase.hooks.beforeAll);
    if (beforeAllResult) report.hooks.push(beforeAllResult);

    const parallelResults = await this.runTestsInParallel(testsToRun);
    for (const { beforeEach, testResult, afterEach } of parallelResults) {
      if (beforeEach) report.hooks.push(beforeEach);
      report.tests.push(testResult);
      if (afterEach) report.hooks.push(afterEach);
    }

    const sequenceResults = await this.runTestsInSequence(sequenceTestsToRun);
    for (const { beforeEach, testResult, afterEach } of sequenceResults) {
      if (beforeEach) report.hooks.push(beforeEach);
      report.tests.push(testResult);
      if (afterEach) report.hooks.push(afterEach);
    }

    const afterAllResult = await this.runHook(this.testCase.hooks.afterAll);
    if (afterAllResult) report.hooks.push(afterAllResult);

    // Update stats
    for (const test of report.tests) {
      if (test.status === "passed") {
        report.stats.passed++;
      } else if (test.status === "failed") {
        report.stats.failed++;
      } else if (test.status === "skipped") {
        report.stats.skipped++;
      } else if (test.status === "softfailed") {
        report.stats.softfailed++;
      } else if (test.status === "todo") {
        report.stats.todo++;
      }
    }

    report.status = report.stats.failed > 0 ? "failed" : "passed";

    return report;
  }
}

export default RunTime;
