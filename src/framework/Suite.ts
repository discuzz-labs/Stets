/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export type TestFunction = () => void | Promise<void>;
type HookFunction = () => void | Promise<void>;

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

export interface Hook {
    type: "beforeAll" | "beforeEach";
    fn: HookFunction;
    timeout: number;
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
    
    /**
     * Represents a Suite.
     * @constructor
     */
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
    /**
     * describe
     * @param {string} description - The description of the describe block
     */
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
    public it(
        description: string,
        fn: TestFunction,
        options: TestOptions = {
            timeout: 0,
            skip: false,
        },
    ): void {
        this.currentSuite.tests.push({
            description,
            fn,
            timeout: options.timeout ? options.timeout : 0,
            skip: options.skip ? options.skip : false,
        });
    }

    // Register a beforeAll hook
    public beforeAll(fn: HookFunction, options: HookOptions): void {
        this.currentSuite.hooks.push({
            type: "beforeAll",
            fn,
            timeout: options.timeout ? options.timeout : 0,
        });
    }

    // Register a beforeEach hook
    public beforeEach(
        fn: HookFunction,
        options: HookOptions = {
            timeout: 0,
        },
    ): void {
        this.currentSuite.hooks.push({
            type: "beforeEach",
            fn,
            timeout: options.timeout ? options.timeout : 0,
        });
    }

    run(): SuiteCase {
        return this.rootSuite;
    }
}
