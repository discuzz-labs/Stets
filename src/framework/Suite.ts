/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { LifeCycleFunction, AfterBeforeLifeCycleFunction, TestFunction, Test, TestMetadata } from "../types";

export interface Suite {
  description: string;
  tests: Test[];

  beforeAllFn: AfterBeforeLifeCycleFunction;
  afterAllFn: AfterBeforeLifeCycleFunction;
  beforeEachFn: LifeCycleFunction;
  afterEachFn: LifeCycleFunction;

  beforeAll(fn: AfterBeforeLifeCycleFunction): this;
  afterAll(fn: AfterBeforeLifeCycleFunction): this;
  beforeEach(fn: LifeCycleFunction): this;
  afterEach(fn: LifeCycleFunction): this;
  it(description: string, fn: TestFunction, options?: Partial<TestMetadata>): this;

  testBefore(): { test: Test, metadata: TestMetadata } | null;
  testAfter(): { test: Test, metadata: TestMetadata } | null;
}

export class Suite implements Suite {
  public description: string = "";
  public tests: Test[] = [];
  public currentTestIndex: number = -1;  // Track the index of the currently running test
  public testMetadata: Map<number, TestMetadata> = new Map();  // Store metadata by index

  public beforeAllFn: AfterBeforeLifeCycleFunction = async () => {};
  public afterAllFn: AfterBeforeLifeCycleFunction = async () => {};
  public beforeEachFn: LifeCycleFunction = async () => {};
  public afterEachFn: LifeCycleFunction = async () => {};

  /**
   * Creates a new test suite instance.
   * @param description - A description of the test suite.
   */
  constructor(description: string) {
    this.description = description;
  }

  /**
   * Sets a function to be run before all tests in the suite.
   * @param fn - The function to run before all tests.
   * @returns The current instance of Suite for chaining.
   */
  beforeAll(fn: AfterBeforeLifeCycleFunction ): this {
    this.beforeAllFn = fn;
    return this;
  }

  /**
   * Sets a function to be run after all tests in the suite.
   * @param fn - The function to run after all tests.
   * @returns The current instance of Suite for chaining.
   */
  afterAll(fn: AfterBeforeLifeCycleFunction): this {
    this.afterAllFn = fn;
    return this;
  }

  /**
   * Sets a function to be run before each test in the suite.
   * @param fn - The function to run before each test.
   * @returns The current instance of Suite for chaining.
   */
  beforeEach(fn: LifeCycleFunction): this {
    this.beforeEachFn = fn;
    return this;
  }

  /**
   * Sets a function to be run after each test in the suite.
   * @param fn - The function to run after each test.
   * @returns The current instance of Suite for chaining.
   */
  afterEach(fn: LifeCycleFunction): this {
    this.afterEachFn = fn;
    return this;
  }

  /**
   * Adds a test to the suite with optional metadata (preRun, postRun, dependencies, and a unique tag).
   * @param description - A description of the test.
   * @param fn - The function to run as the test.
   * @param options - Optional metadata for the test (preRun, postRun, dependencies, unique tag, ignore).
   * @returns The current instance of Suite for chaining.
   */
  it(description: string, fn: TestFunction, options: Partial<TestMetadata> = {}): this {
    const testIndex = this.tests.length;

    // Add the test to the suite
    this.tests.push({
      description,
      fn: async () => {
        // Update the current test index
        this.currentTestIndex = testIndex;

        // Get the current test metadata
        const metadata = this.testMetadata.get(testIndex) || { index: testIndex };

        // Run pre-run function if provided
        if (options.preRun) await options.preRun(this, metadata);

        // Execute the actual test function
        await fn(this, metadata);

        // Run post-run function if provided
        if (options.postRun) await options.postRun(this, metadata);
      },
      ignore: options.ignore
    });

    // Store metadata
    this.testMetadata.set(testIndex, {
      index: testIndex,
      ...options
    });

    return this;
  }

  /**
   * Returns the test and its metadata that immediately precedes the current test.
   * @returns The preceding test and its metadata, or null if there is no preceding test.
   */
  testBefore(): { test: Test, metadata: TestMetadata } | null {
    const previousIndex = this.currentTestIndex - 1;

    if (previousIndex < 0) {
      // No previous test exists
      return null;
    }

    const previousTest = this.tests[previousIndex];
    const previousMetadata = this.testMetadata.get(previousIndex) || { index: previousIndex };

    return { test: previousTest, metadata: previousMetadata };
  }

  /**
   * Returns the test and its metadata that immediately follows the current test.
   * @returns The following test and its metadata, or null if there is no following test.
   */
  testAfter(): { test: Test, metadata: TestMetadata } | null {
    const nextIndex = this.currentTestIndex + 1;

    if (nextIndex >= this.tests.length) {
      // No next test exists
      return null;
    }

    const nextTest = this.tests[nextIndex];
    const nextMetadata = this.testMetadata.get(nextIndex) || { index: nextIndex };

    return { test: nextTest, metadata: nextMetadata };
  }
}
