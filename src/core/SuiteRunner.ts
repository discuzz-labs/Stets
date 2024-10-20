/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import type { HookResult, SuiteReport, TestResult } from "../types";
import type { Hook, SuiteCase, Test } from "../framework/Suite";

export class SuiteRunner {
    suite: SuiteCase

    constructor(suite: SuiteCase) {
        this.suite = suite;
    }

    /**
     * Execute the suite and return a new report.
     */
    public async run(): Promise<SuiteReport> {
        const suiteReport: SuiteReport = {
            passed: true,
            description: this.suite.description,
            passedTests: 0,
            failedTests: 0,
            tests: [],
            hooks: [],
            children: [],
        };

        try {
            await this.runHooks(suiteReport);
            await this.runTests(suiteReport);
            await this.runChildSuites(suiteReport);
        } catch (error: any) {
            suiteReport.error = error;
        } finally {
            return suiteReport; // Return the new report for this suite
        }
    }

    private async runHooks(suiteReport: SuiteReport): Promise<void> {
        for (const hook of this.suite.hooks) {
            const hookResult = await this.executeHook(hook);
            suiteReport.hooks.push(hookResult);

            // Increment passed or failed counters based on hook result
            if (hookResult.passed) {
                suiteReport.passedTests += 1;
            } else {
                suiteReport.failedTests += 1;
                suiteReport.passed = false;
            }
        }
    }

    private async executeHook(hook: Hook): Promise<HookResult> {
        let hookResult: HookResult = {
            type: hook.type,
            passed: true,
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

    private async runTests(suiteReport: SuiteReport): Promise<void> {
        for (const test of this.suite.tests) {
            const testResult = await this.executeTest(test);
            suiteReport.tests.push(testResult);

            // Increment passed or failed counters based on test result
            if (testResult.passed) {
                suiteReport.passedTests += 1;
            } else {
                suiteReport.failedTests += 1;
                suiteReport.passed = false;
            }
        }
    }

    private async executeTest(test: Test): Promise<TestResult> {
        let testResult: TestResult = {
            description: test.description,
            passed: true,
        };

        try {
            await test.fn();
        } catch (error: any) {
            testResult.passed = false;
            testResult.error = error;
        }

        return testResult;
    }

    private async runChildSuites(suiteReport: SuiteReport): Promise<void> {
        for (const childSuite of this.suite.children) {
            const childRunner = new SuiteRunner(childSuite);
            const childResult = await childRunner.run();
            suiteReport.children.push(childResult);

            if (!childResult.passed) {
                suiteReport.passed = false;
            }
        }
    }
}
