/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { format } from "util";
import Run from "./Run";
import { ErrorMetadata } from "../utils/ErrorParser";

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface Options {
  timeout: number;
  skip: boolean;
  if:
    | boolean
    | undefined
    | null
    | (() => boolean | Promise<boolean> | null | undefined);
  retry: number;
  softFail: boolean;
  sequence: boolean;
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
  status: "passed" | "failed" | "soft-fail" | "skipped";
  retries: number;
  error?: ErrorMetadata;
};

export type HookResult = {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  status: "passed" | "failed" | "soft-fail" | "skipped";
  retries: number;
  error?: ErrorMetadata;
};

export interface Stats {
  total: number;
  skipped: number;
  passed: number;
  failed: number;
  softFailed: number;
}

export interface TestReport {
  stats: Stats;
  description: string;
  status: "passed" | "failed";
  tests: TestResult[];
  hooks: HookResult[];
}

const DEFAULT_OPTIONS: Options = {
  timeout: 0,
  skip: false,
  softFail: false,
  if: true,
  retry: 0,
  sequence: false,
};

// Merge the provided options with the default options
function mergeOptions(options?: Partial<Options>): Options {
  return { ...DEFAULT_OPTIONS, ...options };
}

// Top Level API
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

  constructor(description: string) {
    this.description = description;
    this.tests = [];
    this.onlyTests = [];
    this.hooks = {};
  }

  should(description: string) {
    this.description = description;
  }

  each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions(options);
    table.forEach((data) => {
      const formattedDescription = format(description, ...data);
      this.it(formattedDescription, () => fn(...data), mergedOptions);
    });
  }

  // Define a test
  public it(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    this.tests.push({ description, fn, options: mergeOptions(options) });
  }

  public sequence(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, sequence: true });
    this.tests.push({ description, fn, options: mergedOptions });
  }

  public retry(
    retry: number = 0,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, retry });
    this.tests.push({ description, fn, options: mergedOptions });
  }

  public timeout(
    timeout: number = 0,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, timeout });
    this.tests.push({ description, fn, options: mergedOptions });
  }

  public todo(description: string, options?: Partial<Options>): void {
    this.tests.push({
      description,
      fn: () => {},
      options: mergeOptions(options),
    });
  }

  public itIf(
    condition:
      | boolean
      | undefined
      | null
      | (() => boolean | Promise<boolean> | null | undefined),
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    this.it(description, fn, { ...options, if: condition });
  }

  public fail(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, softFail: true });
    this.tests.push({ description, fn, options: mergedOptions });
  }

  // Define an 'only' test (executes only these tests)
  public only(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    this.onlyTests.push({ description, fn, options: mergeOptions(options) });
  }

  // Skip a test
  public skip(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, skip: true });
    this.tests.push({ description, fn, options: mergedOptions });
  }

  // Define 'beforeAll' hook
  public beforeAll(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.beforeAll = {
      description: "beforeAll",
      fn,
      options: mergeOptions(options),
    };
  }

  // Define 'beforeEach' hook
  public beforeEach(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.beforeEach = {
      description: "beforeEach",
      fn,
      options: mergeOptions(options),
    };
  }

  // Define 'afterAll' hook
  public afterAll(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.afterAll = {
      description: "afterAll",
      fn,
      options: mergeOptions(options),
    };
  }

  // Define 'afterEach' hook
  public afterEach(fn: HookFunction, options?: Partial<Options>): void {
    this.hooks.afterEach = {
      description: "afterEach",
      fn,
      options: mergeOptions(options),
    };
  }

  async run(): Promise<TestReport> {
    return await new Run(this).run();
  }
}

export default TestCase;
