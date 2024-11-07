/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { format } from "util";
import Run from "./Run";

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface Test {
  description: string;
  fn: TestFunction;
  timeout: number;
}

export interface Hook {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  fn: HookFunction;
  timeout: number;
}

export type TestResult = {
  description: string;
  status: "passed" | "failed";
  error?: { message: string; stack: string };
};

export type HookResult = {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  status: "passed" | "failed";
  error?: { message: string; stack: string };
};

export type TestReport = {
  stats: {
    total: number;
    passed: number;
    failures: number;
  };
  description: string
  passed: boolean;
  tests: TestResult[];
  hooks: HookResult[];
};

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

  each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    timeout = 0
  ): void {
    table.forEach((data) => {
      const formattedDescription = format(description, ...data);
      this.it(formattedDescription, () => fn(...data), timeout);
    });
  }

  // Define a test
  public it(description: string, fn: TestFunction, timeout = 0): void {
    this.tests.push({ description, fn, timeout });
  }

  // Define an 'only' test (executes only these tests)
  public only(description: string, fn: TestFunction, timeout = 0): void {
    this.onlyTests.push({ description, fn, timeout });
  }

  // Skip a test
  public skip(description: string, fn: TestFunction, timeout = 0): void {
    return; // Skipped tests aren't added to the tests array
  }

  // Define 'beforeAll' hook
  public beforeAll(fn: HookFunction, timeout = 0): void {
    this.hooks.beforeAll = { description: "beforeAll", fn, timeout };
  }

  // Define 'beforeEach' hook
  public beforeEach(fn: HookFunction, timeout = 0): void {
    this.hooks.beforeEach = { description: "beforeEach", fn, timeout };
  }

  // Define 'afterAll' hook
  public afterAll(fn: HookFunction, timeout = 0): void {
    this.hooks.afterAll = { description: "afterAll", fn, timeout };
  }

  // Define 'afterEach' hook
  public afterEach(fn: HookFunction, timeout = 0): void {
    this.hooks.afterEach = { description: "afterEach", fn, timeout };
  }

  async run() : Promise<TestReport> {
    return await new Run(this).run();
  }
}

export default TestCase;
