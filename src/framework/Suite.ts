/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */


export type TestFunction = () => void;
export type HookFunction = () => void;

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

export interface SuiteCase {
    description: string;
    children: SuiteCase[];
    tests: Test[];
    hooks: Hook[];
}

// suite.ts
class Suite {
    private rootSuite: SuiteCase;
    private currentSuite: SuiteCase;

    constructor() {
        this.rootSuite = {
            description: "Root",
            children: [],
            tests: [],
            hooks: [],
        };
        this.currentSuite = this.rootSuite;
    }

    describe(description: string, callback: () => void) {
        const newSuite: SuiteCase = {
            description,
            children: [],
            tests: [],
            hooks: [],
        };
        this.currentSuite.children.push(newSuite);
        const previousSuite = this.currentSuite;
        this.currentSuite = newSuite;

        callback();

        this.currentSuite = previousSuite;
    }

    it(description: string, fn: TestFunction, timeout = 0) {
        this.currentSuite.tests.push({ description, fn, timeout });
    }

    skip(description: string, fn: TestFunction, timeout = 0) {
        return;
    }

    only(description: string, fn: TestFunction, timeout = 0) {
        this.currentSuite.tests.push({ description, fn, timeout, only: true });
    }

    beforeAll(fn: HookFunction, timeout = 0) {
        this.currentSuite.hooks.push({ description: "beforeAll", fn, timeout });
    }

    beforeEach(fn: HookFunction, timeout = 0) {
        this.currentSuite.hooks.push({ description: "beforeEach", fn, timeout });
    }

    run(): SuiteCase {
        // Check if there are any tests marked with "only"
        const hasOnlyTests = this.rootSuite.tests.some(test => test.only);

        // If "only" tests exist, filter out tests that are not marked as "only"
        if (hasOnlyTests) {
            this.rootSuite.tests = this.rootSuite.tests.filter(test => test.only);
        }

        return this.rootSuite;
    }
}

export default Suite;
