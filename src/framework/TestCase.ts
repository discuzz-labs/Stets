/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { format } from "util";
import Run from "./Run";

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface Options {
  timeout: number;
  skip: boolean;
}

export interface Test {
  description: string;
  fn: TestFunction;
  options: Options;
}

export interface Hook {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  fn: HookFunction;
  options: Options;
}

export type TestResult = {
  description: string;
  status: "passed" | "failed" | "skipped";
  error?: { message: string; stack: string };
};

export type HookResult = {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  status: "passed" | "failed" | "skipped";
  error?: { message: string; stack: string };
};

export type TestReport = {
  stats: {
    total: number;
    skipped: number;
    passed: number;
    failed: number;
  };
  description: string;
  passed: boolean;
  tests: TestResult[];
  hooks: HookResult[];
};

const DEFAULT_OPTIONS: Options = { timeout: 0, skip: false };

// Merge the provided options with the default options
function mergeOptions(options?: Partial<Options>): Options {
  return { ...DEFAULT_OPTIONS, ...options };
}

class TestCase {
  public description: string;
  public tests: Test[];
  public onlyTests: Test[];
  public hooks: {
    beforeAll?: Hook;
    beforeEach?: Hook;
    afterAll?: Hook;
    afterEach?: Hook;
  };

  constructor(description: string = "Root") {
    this.description = description;
    this.tests = [];
    this.onlyTests = [];
    this.hooks = {};
  }

  new(description: string = "Root") {
    this.description = description;
    return this
  }

  each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    options?: Partial<Options>
  ): void {
    const mergedOptions = mergeOptions(options);
    table.forEach((data) => {
      const formattedDescription = format(description, ...data);
      this.it(formattedDescription, () => fn(...data), mergedOptions);
    });
  }

  // Define a test
  public it(description: string, fn: TestFunction, options?: Partial<Options>): void {
    this.tests.push({ description, fn, options: mergeOptions(options) });
  }

  // Define an 'only' test (executes only these tests)
  public only(description: string, fn: TestFunction, options?: Partial<Options>): void {
    this.onlyTests.push({ description, fn, options: mergeOptions(options) });
  }

  // Skip a test
  public skip(description: string, fn: TestFunction, options?: Partial<Options>): void {
    const mergedOptions = mergeOptions({ ...options, skip: true });
    this.tests.push({ description, fn, options: mergedOptions });
  }

  // Define 'beforeAll' hook
  public beforeAll(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.beforeAll = { description: "beforeAll", fn, options: mergeOptions(options) };
  }

  // Define 'beforeEach' hook
  public beforeEach(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.beforeEach = { description: "beforeEach", fn, options: mergeOptions(options) };
  }

  // Define 'afterAll' hook
  public afterAll(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.afterAll = { description: "afterAll", fn, options: mergeOptions(options) };
  }

  // Define 'afterEach' hook
  public afterEach(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.afterEach = { description: "afterEach", fn, options: mergeOptions(options) };
  }

  async run(): Promise<TestReport> {
    return await new Run(this).run();
  }
}

export default TestCase;
