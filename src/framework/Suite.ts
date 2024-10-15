/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

type TestFunction = () => void | Promise<void>;
type HookFunction = () => void | Promise<void>;

interface TestCase {
    description: string;
    fn: TestFunction;
}

interface Hook {
    type: 'beforeAll' | 'beforeEach';
    fn: HookFunction;
}

interface Suite {
    description: string;
    tests: TestCase[];
    hooks: Hook[];
    children: Suite[];
}

const rootSuite: Suite = { description: 'Root Suite', tests: [], hooks: [], children: [] };
let currentSuite: Suite = rootSuite;

// Register a new describe block
export function describe(description: string, callback: () => void): void {
    const newSuite: Suite = { description, tests: [], hooks: [], children: [] };
    currentSuite.children.push(newSuite);
    const previousSuite = currentSuite; // Save current suite
    currentSuite = newSuite; // Set the current suite to the new one

    callback(); // Execute the callback to register tests/hooks in the current suite

    currentSuite = previousSuite; // Restore previous suite context
}

// Register a test case
export function it(description: string, fn: TestFunction): void {
    currentSuite.tests.push({ description, fn });
}

// Register a beforeAll hook
export function beforeAll(fn: HookFunction): void {
    currentSuite.hooks.push({ type: 'beforeAll', fn });
}

// Register a beforeEach hook
export function beforeEach(fn: HookFunction): void {
    currentSuite.hooks.push({ type: 'beforeEach', fn });
}

// Helper function to run a suite and its nested suites
async function runSuite(suite: Suite): Promise<any[]> {
    const results = [];

    // Run all beforeAll hooks for the current suite
    for (const hook of suite.hooks) {
        if (hook.type === 'beforeAll') await hook.fn();
    }

    // Run all tests in the current suite
    for (const test of suite.tests) {
        let result = { description: test.description, passed: true, error: {} };
        try {
            // Run the test
            await test.fn();
        } catch (error: any) {
            result.passed = false;
            result.error = { message: error.message, stack: error.stack };
        }
        results.push(result);
    }

    // Recursively run child suites
    for (const childSuite of suite.children) {
        const childResults = await runSuite(childSuite);
        results.push(...childResults);
    }

    return results;
}

// Execute all suites starting from the root suite
export async function run(): Promise<void> {
    const results = await runSuite(rootSuite);
    if (process && process.send) {
        process.send({ type: 'results', results });
    }
}
