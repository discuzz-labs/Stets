/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import type { HookResult, SuiteReport, TestResult } from "../types";
import type { Hook, Suite, Test } from "../framework/Suite";

export class SuiteRunner {
    private suite: Suite;
    private suiteReport: SuiteReport;

    constructor(suite: Suite) {
        this.suite = suite;
        this.suiteReport = {
            passed: true,
            description: suite.description,
            passedTests: 0,
            failedTests: 0,
            tests: [],
            hooks: [],
            children: [],
            error: { message: null, stack: null },
        };
    }

    /**
     * Reset the passedTests and failedTests counters for a new suite.
     */
    private resetCounters(): void {
        this.suiteReport.passedTests = 0;
        this.suiteReport.failedTests = 0;
    }

    /**
     * Run all hooks (beforeAll) for the suite.
     */
    private async runHooks(): Promise<void> {
        for (const hook of this.suite.hooks) {
            const hookResult = await this.executeHook(hook);
            this.suiteReport.hooks.push(hookResult);

            // Increment passed or failed counters based on hook result
            if (hookResult.passed) {
                this.suiteReport.passedTests += 1;
            } else {
                this.suiteReport.failedTests += 1;
                this.suiteReport.passed = false;
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
            this.suiteReport.tests.push(testResult);

            // Increment passed or failed counters based on test result
            if (testResult.passed) {
                this.suiteReport.passedTests += 1;
            } else {
                this.suiteReport.failedTests += 1;
                this.suiteReport.passed = false;
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
            // Reset counters for the child suite
            const childRunner = new SuiteRunner(childSuite);
            childRunner.resetCounters(); // Reset counters for child suite

            const childResult = await childRunner.run();
            this.suiteReport.children.push(childResult);

            // Add the passed/failed tests from the child suite to the parent suite
            this.suiteReport.passedTests += childResult.passedTests;
            this.suiteReport.failedTests += childResult.failedTests;

            if (!childResult.passed) {
                this.suiteReport.passed = false;
            }
        }
    }

    /**
     * Run the entire suite (hooks, tests, and child suites), and return the result.
     */
    public async run(): Promise<SuiteReport> {
        try {
            // Reset counters at the beginning of the run
            this.resetCounters();

            // Run hooks, tests, and child suites
            await this.runHooks();
            await this.runTests();
            await this.runChildSuites();
        } catch (error: any) {
            this.suiteReport.error = {
                message: error.message,
                stack: error.stack,
            };
        }
        // Report the results for this specific suite
        return this.suiteReport;
    }
}

