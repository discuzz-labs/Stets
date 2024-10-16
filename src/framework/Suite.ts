/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteRunner } from "../core/SuiteRunner";
import type { SuiteReport } from "../types";

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

export interface Suite {
    description: string;
    tests: Test[];
    hooks: Hook[];
    children: Suite[];
}

const rootSuite: Suite = {
    description: "Root Suite of the file (always empty)",
    children: [],
    tests: [],
    hooks: [],
};
let currentSuite: Suite = rootSuite;

// Register a new describe block
export function describe(description: string, callback: () => void): void {
    const newSuite: Suite = {
        description,
        tests: [],
        hooks: [],
        children: [],
    };
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
    currentSuite.hooks.push({ type: "beforeAll", fn });
}

// Register a beforeEach hook
export function beforeEach(fn: HookFunction): void {
    currentSuite.hooks.push({ type: "beforeEach", fn });
}

// Execute all suites starting from the root suite
export async function run(): Promise<SuiteReport> {
    const rootRunner = new SuiteRunner(rootSuite);
    const report = await rootRunner.run();
    return report
}
