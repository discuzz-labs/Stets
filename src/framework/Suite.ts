/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import Run from "./Run";
import { format } from "util";

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface Test {
  description: string;
  fn: TestFunction;
  timeout: number;
  only?: boolean;
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
  public description: string;
  public children: Suite[];
  public tests: Test[];
  public hooks: Hook[];
  public parent: Suite | null;
  public onlyMode: boolean;
  public static currentSuite: Suite;

  constructor(description: string = "Root", parent: Suite | null = null) {
    this.description = description;
    this.children = [];
    this.tests = [];
    this.hooks = [];
    this.parent = parent;
    this.onlyMode = false;

    if (!parent) {
      Suite.currentSuite = this;
    }
  }

  Describe(description: string, callback: () => void): void {
    const childSuite = new Suite(description, this);
    this.children.push(childSuite);

    const previousSuite = Suite.currentSuite;
    Suite.currentSuite = childSuite;

    callback();

    Suite.currentSuite = previousSuite;
  }

  Skip(description: string, callback: () => void): void {
    return;
  }
  
  Each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void,
  ): void {
    table.forEach((data) => {
      const formattedDescription = format(description, ...data);
      // Call describe with the formatted description and the callback function
      this.Describe(formattedDescription, () => fn(...data));
    });
  }

  it(description: string, fn: TestFunction, timeout = 0): void {
    Suite.currentSuite.tests.push({ description, fn, timeout });
  }

  only(description: string, fn: TestFunction, timeout = 0): void {
    Suite.currentSuite.tests.push({ description, fn, timeout, only: true });
    Suite.currentSuite.setOnlyMode();
  }

  each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    timeout = 0,
  ): void {
    table.forEach((data, index) => {
      const formattedDescription = format(description, ...data);
      this.it(formattedDescription, () => fn(...data), timeout);
    });
  }

  skip(description: string, fn: TestFunction, timeout = 0): void {
    return;
  }

  private setOnlyMode(): void {
    this.onlyMode = true;
    if (this.parent) {
      this.parent.setOnlyMode();
    }
  }

  beforeAll(fn: HookFunction, timeout = 0): void {
    Suite.currentSuite.hooks.push({
      description: "beforeAll",
      fn,
      timeout,
    });
  }

  beforeEach(fn: HookFunction, timeout = 0): void {
    Suite.currentSuite.hooks.push({
      description: "beforeEach",
      fn,
      timeout,
    });
  }

  afterAll(fn: HookFunction, timeout = 0): void {
    Suite.currentSuite.hooks.push({
      description: "afterAll",
      fn,
      timeout,
    });
  }

  afterEach(fn: HookFunction, timeout = 0): void {
    Suite.currentSuite.hooks.push({
      description: "afterEach",
      fn,
      timeout,
    });
  }

  async run(): Promise<SuiteReport> {
    return new Run(this).run();
  }
}

export default Suite;
