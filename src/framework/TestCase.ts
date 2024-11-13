/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { format } from "util";
import RunTime from "./RunTime";
import { ErrorMetadata } from "../utils/ErrorParser";

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;
export type Status = "passed" | "failed" | "soft-failed" | "skipped" | "empty"
export type HookTypes = "afterAll" | "afterEach" | "beforeAll" | "beforeEach"

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
  sequencial: boolean;
}
  
export interface Test {
  description: string;
  fn: TestFunction;
  options: Options;
}

export interface Hook {
  description: HookTypes;
  fn: HookFunction;
  options: Options;
}

export type TestResult = {
  description: string;
  status: Status ;
  retries: number;
  error?: ErrorMetadata;
};

export type HookResult = {
  description: HookTypes;
  status: Status;
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
  status: Status;
  tests: TestResult[];
  hooks: HookResult[];
}

const DEFAULT_OPTIONS: Options = {
  timeout: 0,
  skip: false,
  softFail: false,
  if: true,
  retry: 0,
  sequencial: false
};

// Merge the provided options with the default options
function mergeOptions(options?: Partial<Options>): Options {
  return { ...DEFAULT_OPTIONS, ...options };
}

// Top Level API
class TestCase {
  public description: string;
  public tests: Test[];
  public sequenceTests: Test[];
  public sequenceOnlyTests: Test[];
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
    this.sequenceTests = []
    this.sequenceOnlyTests = []
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
    if(options?.sequencial) this.sequenceTests.push({ description, fn, options: mergeOptions(options) });
    else this.tests.push({ description, fn, options: mergeOptions(options) });
  }

  public sequence(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    this.sequenceTests.push({ description, fn, options: mergeOptions(options) });
  }

  public retry(
    retry: number = 0,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, retry });
    if(options?.sequencial) this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  public timeout(
    timeout: number = 0,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, timeout });
    if(options?.sequencial) this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
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
    const mergedOptions = mergeOptions({ ...options, if: condition });
    if(options?.sequencial) this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  public fail(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, softFail: true });
    if(options?.sequencial) this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
  }

  // Define an 'only' test (executes only these tests)
  public only(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    if(options?.sequencial) this.sequenceOnlyTests.push({ description, fn, options: mergeOptions(options) });
    else this.onlyTests.push({ description, fn, options: mergeOptions(options) });
  }

  // Skip a test
  public skip(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void {
    const mergedOptions = mergeOptions({ ...options, skip: true });
    if(options?.sequencial) this.sequenceTests.push({ description, fn, options: mergedOptions });
    else this.tests.push({ description, fn, options: mergedOptions });
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
    return await new RunTime(this).run();
  }
}

export default TestCase;
