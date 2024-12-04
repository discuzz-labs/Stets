/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Bench } from '../core/Bench.js';
import type {
  Hook,
  HookResult,
  Test,
  TestResult,
  TestReport,
  Stats,
  TestCaseStatus,
} from './TestCase.js';
import TestCase from './TestCase.js';
import { cpus } from 'os';

class RunTime {
  private readonly MAX_PARALLEL_TESTS = cpus().length || 4;
  private readonly MAX_TIMEOUT = 300_000; // 5 minutes

  constructor(private testCase: TestCase) {}

  // Define a common interface for Test and Hook
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
    } = options;

    const result: TestResult | HookResult = {
      description,
      retries: 0,
      status: 'passed',
      bench: null,
    };

    if (todo) {
      result.status = 'todo';
      return result;
    }

    if (
      skip ||
      condition === undefined ||
      condition === null ||
      !(await this.evaluateCondition(condition))
    ) {
      result.status = 'skipped';
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
                    `${description} exceeded ${fallbackTimeout} ms. ${fallbackTimeout === this.MAX_TIMEOUT ? 'Fallback timeout was used. This test took 5 minutes to finish. Make sure you donot have any dead promises! Finding dead promises: https://swizec.com/blog/finding-unresolved-promises-in-javascript/' : ''} `,
                  ),
                ),
              fallbackTimeout,
            ),
          ),
        ]);

        break;
      } catch (error: any) {
        lastError = error; // Keep track of the last error
        result.retries++;

        // If softFail is set and this was the last attempt, mark as "soft-fail"
        if (result.retries > retry) {
          if (softfail) {
            result.status = 'softfailed';
            result.error = {
              message: `Soft failure: ${lastError.message}`,
              stack: lastError.stack,
            };
          } else {
            result.status = 'failed';
            result.error = {
              message: lastError.message,
              stack: lastError.stack,
            };
          }
          return result;
        }
      }
    }

    if (bench) {
      result.bench = await Bench.run(fn);
      result.status = 'benched';
    }

    return result;
  }

  private async evaluateCondition(
    condition: boolean | (() => boolean | Promise<boolean> | null | undefined),
  ): Promise<boolean> {
    if (typeof condition === 'function') {
      return (await condition()) ?? false;
    }
    return condition ?? true;
  }

  private status(stats: Stats): TestCaseStatus {
    if (stats.total === 0) return 'empty';
    if (stats.failed > 0) return 'failed';

    return 'passed';
  }

  private initializeReport(): TestReport {
    return {
      stats: {
        total: this.calculateTotalTests(),
        passed: 0,
        failed: 0,
        skipped: 0,
        softfailed: 0,
        todo: 0,
      },
      status: 'passed',
      description: this.testCase.description,
      tests: [],
      hooks: [],
    };
  }

  private calculateTotalTests(): number {
    return (
      this.testCase.tests.length +
      this.testCase.sequenceTests.length +
      this.testCase.onlyTests.length +
      this.testCase.sequenceOnlyTests.length
    );
  }

  private async runHook(
    hook: Hook | undefined,
    report: TestReport,
  ): Promise<void> {
    if (hook) {
      const result = await this.execute(hook);
      report.hooks.push(result as HookResult);
    }
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

    return { testsToRun, sequenceTestsToRun };
  }

  private async markSkippedTests(
    report: TestReport,
    testsToRun: Test[],
    sequenceTestsToRun: Test[],
  ): Promise<void> {
    const allTests = [...this.testCase.tests, ...this.testCase.sequenceTests];
    for (const test of allTests) {
      if (!testsToRun.includes(test) && !sequenceTestsToRun.includes(test)) {
        report.tests.push({
          description: test.description,
          status: 'skipped',
        } as TestResult);
      }
    }
  }

  private async runTestsInParallel(
    testsToRun: Test[],
    report: TestReport,
  ): Promise<void> {
    for (let i = 0; i < testsToRun.length; i += this.MAX_PARALLEL_TESTS) {
      const batch = testsToRun.slice(i, i + this.MAX_PARALLEL_TESTS);
      const results = await Promise.all(
        batch.map((test) => this.runSingleTest(test, report)),
      );
      this.updateStatsFromResults(results, report);
    }
  }

  private async runTestsInSequence(
    testsToRun: Test[],
    report: TestReport,
  ): Promise<void> {
    for (const test of testsToRun) {
      const result = await this.runSingleTest(test, report);
      this.updateStatsFromResults([result], report);
    }
  }

  private async runSingleTest(
    test: Test,
    report: TestReport,
  ): Promise<TestResult> {
    await this.runHook(this.testCase.hooks.beforeEach, report);

    const result = (await this.execute(test)) as TestResult;
    report.tests.push(result);

    await this.runHook(this.testCase.hooks.afterEach, report);

    return result;
  }

  private updateStatsFromResults(
    results: TestResult[],
    report: TestReport,
  ): void {
    for (const result of results) {
      if (result.status === 'passed') {
        report.stats.passed++;
      }
      if (result.status === 'benched') {
        report.stats.passed++;
      }
      if (result.status === 'softfailed') {
        report.stats.softfailed++;
      }
      if (result.status === 'failed') {
        report.stats.failed++;
      }
      if (result.status === 'skipped') {
        report.stats.skipped++;
      }
      if (result.status === 'todo') {
        report.stats.todo++;
      }
    }
  }

  // Run all tests and hooks in the TestCase
  async run(): Promise<TestReport> {
    const report: TestReport = this.initializeReport();

    await this.runHook(this.testCase.hooks.beforeAll, report);

    const { testsToRun, sequenceTestsToRun } = this.determineTestsToRun();

    await this.markSkippedTests(report, testsToRun, sequenceTestsToRun);

    await this.runTestsInParallel(testsToRun, report);
    await this.runTestsInSequence(sequenceTestsToRun, report);

    await this.runHook(this.testCase.hooks.afterAll, report);

    report.status = this.status(report.stats);

    return report;
  }
}

export default RunTime;
