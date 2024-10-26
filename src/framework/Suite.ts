/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

interface TestOptions {
    timeout?: number;
    skip?: boolean;
}

interface HookOptions {
    timeout?: number;
}

export interface Test {
    description: string;
    fn: TestFunction;
    timeout: number;
    skip: boolean;
}

export interface SuiteCase {
    description: string;
    children: SuiteCase[];
    tests: TestCase[];
    hooks: Hook[];
}

interface TestCase {
    description: string;
    fn: TestFunction;
    timeout: number;
    skip: boolean;
    only?: boolean;
}

export interface Hook {
    type: "beforeAll" | "beforeEach";
    fn: HookFunction;
    timeout: number;
}

interface TestOptions {
    timeout?: number;
    skip?: boolean;
}

interface HookOptions {
    timeout?: number;
}

export type TestFunction = () => void;
type HookFunction = () => void;

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

    it(
        description: string,
        fn: TestFunction,
        options: TestOptions = { timeout: 0, skip: false }
    ) {
        this.currentSuite.tests.push({
            description,
            fn,
            timeout: options.timeout ?? 0,
            skip: options.skip ?? false,
        });
    }

    beforeAll(
        fn: HookFunction,
        options: HookOptions = { timeout: 0 }
    ) {
        this.currentSuite.hooks.push({
            type: "beforeAll",
            fn,
            timeout: options.timeout ?? 0,
        });
    }

    beforeEach(
        fn: HookFunction,
        options: HookOptions = { timeout: 0 }
    ) {
        this.currentSuite.hooks.push({
            type: "beforeEach",
            fn,
            timeout: options.timeout ?? 0,
        });
    }

    run(): SuiteCase {
        const suiteWithOnlyTests = this.rootSuite.tests.some((test) => test.only);
        if (suiteWithOnlyTests) {
            this.rootSuite.tests = this.rootSuite.tests.filter((test) => test.only);
        }
        return this.rootSuite;
    }
}

export default Suite;