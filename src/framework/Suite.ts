/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */


export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface Test {
    description: string;
    fn: TestFunction;
    timeout: number;
    only?: boolean;
}

export interface Hook {
    description: "beforeAll" | "beforeEach";
    fn: HookFunction;
    timeout: number;
}

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

class Suite {
    private description: string;
    private children: Suite[];
    private tests: Test[];
    private hooks: Hook[];
    private parent: Suite | null;
    private onlyMode: boolean;
    private static currentSuite: Suite;

    constructor(description: string = "Root", parent: Suite | null = null) {
        this.description = description;
        this.children = [];
        this.tests = [];
        this.hooks = [];
        this.parent = parent;
        this.onlyMode = false;

        // If this is the root suite, set it as current
        if (!parent) {
            Suite.currentSuite = this;
        }
    }
    
    describe(description: string, callback: () => void): void {
        const childSuite = new Suite(description, this);
        this.children.push(childSuite);

        // Save previous current suite
        const previousSuite = Suite.currentSuite;
        // Set new current suite
        Suite.currentSuite = childSuite;

        // Execute the callback
        callback();

        // Restore previous suite
        Suite.currentSuite = previousSuite;
    }

    it(description: string, fn: TestFunction, timeout = 0): void {
        // Add test to current suite instead of this
        Suite.currentSuite.tests.push({ description, fn, timeout });
    }

    skip(description: string, fn: TestFunction, timeout = 0): void {
        return
    }

    only(description: string, fn: TestFunction, timeout = 0): void {
        Suite.currentSuite.tests.push({ description, fn, timeout, only: true });
        Suite.currentSuite.setOnlyMode();
    }

    beforeAll(fn: HookFunction, timeout = 0): void {
        Suite.currentSuite.hooks.push({ description: "beforeAll", fn, timeout });
    }

    beforeEach(fn: HookFunction, timeout = 0): void {
        Suite.currentSuite.hooks.push({ description: "beforeEach", fn, timeout });
    }

    private setOnlyMode(): void {
        this.onlyMode = true;
        if (this.parent) {
            this.parent.setOnlyMode();
        }
    }

    private async executeTest(test: Test): Promise<TestResult> {
        const result: TestResult = {
            description: test.description,
            status: "passed",
        };

        try {
            // Execute beforeEach hooks from parent to child
            await this.executeBeforeEachHooks();
            await this.withTimeout(test.fn(), test.timeout, test.description);
        } catch (error: any) {
            result.status = "failed";
            result.error = { message: error.message, stack: error.stack };
        }
        return result;
    }

    private async executeBeforeEachHooks(): Promise<void> {
        // Execute parent beforeEach hooks first
        if (this.parent) {
            await this.parent.executeBeforeEachHooks();
        }

        // Then execute this suite's beforeEach hooks
        const beforeEachHooks = this.hooks.filter(hook => hook.description === "beforeEach");
        for (const hook of beforeEachHooks) {
            await this.executeHook(hook);
        }
    }

    private async executeHook(hook: Hook): Promise<HookResult> {
        const result: HookResult = {
            description: hook.description,
            status: "passed",
        };
        try {
            await this.withTimeout(hook.fn(), hook.timeout, hook.description);
        } catch (error: any) {
            result.status = "failed";
            result.error = { message: error.message, stack: error.stack };
        }
        return result;
    }

    private timeout(ms: number, description: string): Promise<void> {
        return new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(`${description} exceeded ${ms} ms.`)),
                ms,
            ),
        );
    }

    private withTimeout(
        promise: Promise<void> | void,
        ms: number,
        description: string,
    ) {
        return ms > 0
            ? Promise.race([promise, this.timeout(ms, description)])
            : Promise.resolve(promise);
    }

    async run(): Promise<SuiteReport> {
        const report: SuiteReport = {
            passed: true,
            description: this.description,
            metrics: { passed: 0, failed: 0, skipped: 0 },
            tests: [],
            hooks: [],
            children: [],
        };

        // Run beforeAll hooks
        const beforeAllHooks = this.hooks.filter(hook => hook.description === "beforeAll");
        for (const hook of beforeAllHooks) {
            const result = await this.executeHook(hook);
            report.hooks.push(result);
            if (result.status === "failed") {
                report.passed = false;
            }
        }

        // Run tests
        const testsToRun = this.onlyMode
            ? this.tests.filter((test) => test.only)
            : this.tests;

        for (const test of testsToRun) {
            const result = await this.executeTest(test);
            report.tests.push(result);
            report.metrics[result.status]++;
            if (result.status === "failed") {
                report.passed = false;
            }
        }

        // Run child suites
        for (const child of this.children) {
            const childReport = await child.run();
            report.children.push(childReport);
            if (!childReport.passed) {
                report.passed = false;
            }
        }

        return report;
    }
}

export default Suite;