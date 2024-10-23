/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import type { HookResult, SuiteReport, TestResult } from "../types";
import type { Hook, SuiteCase, Test } from "../framework/Suite";

export class SuiteRunner {
    suite: SuiteCase;

    constructor(suite: SuiteCase) {
        this.suite = suite;
    }

    public async run(): Promise<SuiteReport> {
        const suiteReport: SuiteReport = {
            passed: true,
            description: this.suite.description,
            metrics: {
                passed: 0,
                failed: 0,
                skipped: 0,
            },
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
            return suiteReport;
        }
    }

    private async runHooks(suiteReport: SuiteReport): Promise<void> {
        for (const hook of this.suite.hooks) {
            const hookResult: HookResult = await this.executeHook(hook);
            suiteReport.hooks.push(hookResult);

            if (hookResult.status === "passed") suiteReport.metrics.passed += 1;
            else if (hookResult.status === "skipped")
                suiteReport.metrics.skipped += 1;
            else suiteReport.metrics.failed += 1;
            suiteReport.passed = false;
        }
    }

    private async executeHook(hook: Hook): Promise<HookResult> {
        let hookResult: HookResult = {
            type: hook.type,
            status: "passed",
        };

        try {
            await this.withTimeout(hook.fn(), hook.timeout, hook.type);
        } catch (error: any) {
            hookResult.status = "failed";
            hookResult.error = {
                message: error.message,
                stack: error.stack,
            };
        } finally {
            return hookResult;
        }
    }

    private async runTests(suiteReport: SuiteReport): Promise<void> {
        for (const test of this.suite.tests) {
            if (test.skip) {
                continue;
            }

            const testResult = await this.executeTest(test);
            suiteReport.tests.push(testResult);

            if (testResult.status === "passed") suiteReport.metrics.passed += 1;
            else if (testResult.status === "skipped")
                suiteReport.metrics.skipped += 1;
            else suiteReport.metrics.failed += 1;
            suiteReport.passed = false;
        }
    }

    private async executeTest(test: Test): Promise<TestResult> {
        let testResult: TestResult = {
            description: test.description,
            status: "passed",
        };

        try {
            await this.withTimeout(test.fn(), test.timeout, test.description);
        } catch (error: any) {
            testResult.status = "failed";
            testResult.error = error;
        } finally {
            return testResult;
        }
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

    private async timeout(ms: number, test: string): Promise<void> {
        return new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(`${test} took more than ${ms} ms.`)),
                ms,
            ),
        );
    }

    private withTimeout(
        promise: Promise<void> | void,
        ms: number,
        test: string,
    ) {
        if (ms <= 0) {
            return Promise.resolve(promise); // No timeout, just return the original promise
        }
        return Promise.race([promise, this.timeout(ms, test)]);
    }
}
