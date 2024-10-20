/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export type TestFunction = () => void | Promise<void>;
type HookFunction = () => void | Promise<void>;

export interface Test {
    description: string;
    fn: TestFunction;
}

export interface Hook {
    type: "beforeAll" | "beforeEach";
    fn: HookFunction;
}

export interface SuiteCase {
    description: string;
    tests: Test[];
    hooks: Hook[];
    children: SuiteCase[];
}

export default class Suite {
    rootSuite: SuiteCase;
    currentSuite: SuiteCase;

    constructor() {
        this.rootSuite = {
            description: "Root",
            children: [],
            tests: [],
            hooks: [],
        };
        this.currentSuite = this.rootSuite;
    }

    // Register a new describe block
    public describe(description: string, callback: () => void): void {
        const newSuite: SuiteCase = {
            description,
            tests: [],
            hooks: [],
            children: [],
        };
        this.currentSuite.children.push(newSuite);
        const previousSuite = this.currentSuite; // Save current suite
        this.currentSuite = newSuite; // Set the current suite to the new one

        callback(); // Execute the callback to register tests/hooks in the current suite

        this.currentSuite = previousSuite; // Restore previous suite context
    }

    // Register a test case
    public it(description: string, fn: TestFunction): void {
        this.currentSuite.tests.push({ description, fn });
    }

    // Register a beforeAll hook
    public beforeAll(fn: HookFunction): void {
        this.currentSuite.hooks.push({ type: "beforeAll", fn });
    }

    // Register a beforeEach hook
    public beforeEach(fn: HookFunction): void {
        this.currentSuite.hooks.push({ type: "beforeEach", fn });
    }

    run(): SuiteCase {
        
        return this.rootSuite;
    }
}