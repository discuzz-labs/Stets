/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import type { Hook, SuiteCase, Test } from "../framework/Suite";

///types
export type TestResult = {
  description: string;
  status: "passed" | "failed";
  error?: { message: string; stack: string };
};

export type HookResult = {
  description: "beforeAll" | "beforeEach";
  status: "passed" | "failed";
  error?: { message: string; stack: string };
};

export type SuiteReport = {
  passed: boolean;
  description: string;
  metrics: {
    passed: number;
    failed: number;
    skipped: number;
  };
  tests: Array<TestResult>;
  hooks: Array<HookResult>;
  children: SuiteReport[];
  error?: string;
};

export class SuiteRunner {
    suite: SuiteCase;

    constructor(suite: SuiteCase) {
        this.suite = suite;
    }

    public async run(): Promise<SuiteReport> {
        const suiteReport: SuiteReport = {
            passed: true,
            description: this.suite.description,
            metrics: { passed: 0, failed: 0, skipped: 0 },
            tests: [],
            hooks: [],
            children: [],
        };

        await this.runHooks(suiteReport);
        await this.runTests(suiteReport);
        await this.runChildSuites(suiteReport);

        return suiteReport;
    }

    private async runHooks(suiteReport: SuiteReport): Promise<void> {
        for (const hook of this.suite.hooks) {
            const result = await this.executeHook(hook);
            suiteReport.hooks.push(result);
            suiteReport.metrics[result.status]++;
            if (result.status === "failed") suiteReport.passed = false;
        }
    }

    private async executeHook(hook: Hook): Promise<HookResult> {
        const result: HookResult = { description: hook.description, status: "passed" };
        try {
            await this.withTimeout(hook.fn(), hook.timeout, hook.description);
        } catch (error: any) {
            result.status = "failed";
            result.error = { message: error.message, stack: error.stack };
        }
        return result;
    }

    private async runTests(suiteReport: SuiteReport): Promise<void> {
        for (const test of this.suite.tests) {
            const result = await this.executeTest(test);
            suiteReport.tests.push(result);
            suiteReport.metrics[result.status]++;
            if (result.status === "failed") suiteReport.passed = false;
        }
    }

    private async executeTest(test: Test): Promise<TestResult> {
        const result: TestResult = { description: test.description, status: "passed" };
        try {
            await this.withTimeout(test.fn(), test.timeout, test.description);
        } catch (error: any) {
            result.status = "failed";
            result.error = { message: error.message, stack: error.stack };
        }
        return result;
    }

    private async runChildSuites(suiteReport: SuiteReport): Promise<void> {
        for (const child of this.suite.children) {
            const childReport = await new SuiteRunner(child).run();
            suiteReport.children.push(childReport);
            if (!childReport.passed) suiteReport.passed = false;
        }
    }

    private timeout(ms: number, description: string): Promise<void> {
        return new Promise((_, reject) => setTimeout(() => reject(new Error(`${description} exceeded ${ms} ms.`)), ms));
    }

    private withTimeout(promise: Promise<void> | void, ms: number, description: string) {
        return ms > 0 ? Promise.race([promise, this.timeout(ms, description)]) : Promise.resolve(promise);
    }
}
