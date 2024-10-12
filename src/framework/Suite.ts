/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { LifeCycleFunction, AfterBeforeLifeCycleFunction, TestFunction, Test, TestMetadata } from "../types";

export interface Suite {
  description: string;
  tests: Test[];
  currentTestIndex: number;
  testMetadata: Map<number, TestMetadata>

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
  public currentTestIndex: number = -1; // Track the index of the currently running test
  public testMetadata: Map<number, TestMetadata> = new Map(); // Store metadata by index

  public beforeAllFn: AfterBeforeLifeCycleFunction = async () => {};
  public afterAllFn: AfterBeforeLifeCycleFunction = async () => {};
  public beforeEachFn: LifeCycleFunction = async () => {};
  public afterEachFn: LifeCycleFunction = async () => {};

  constructor(description: string) {
    this.description = description;
  }

  beforeAll(fn: AfterBeforeLifeCycleFunction): this {
    this.beforeAllFn = fn;
    return this;
  }

  afterAll(fn: AfterBeforeLifeCycleFunction): this {
    this.afterAllFn = fn;
    return this;
  }

  beforeEach(fn: LifeCycleFunction): this {
    this.beforeEachFn = fn;
    return this;
  }

  afterEach(fn: LifeCycleFunction): this {
    this.afterEachFn = fn;
    return this;
  }

  it(description: string, fn: TestFunction, options: Partial<TestMetadata> = {}): this {
    const testIndex = this.tests.length;

    // Add the test to the suite
    this.tests.push({
      description,
      fn
    });

    // Store metadata
    this.testMetadata.set(testIndex, {
      index: testIndex,
      ...options,
    });

    return this;
  }
  
  testBefore(): { test: Test, metadata: TestMetadata | { index : number} } | null {
    const previousIndex = this.currentTestIndex - 1;

    if (previousIndex < 0) {
      return null;
    }

    const previousTest = this.tests[previousIndex];
    const previousMetadata = this.testMetadata.get(previousIndex) || { index: previousIndex };

    return { test: previousTest, metadata: previousMetadata };
  }

  testAfter(): { test: Test, metadata: TestMetadata | { index: number } } | null {
    const nextIndex = this.currentTestIndex + 1;

    if (nextIndex >= this.tests.length) {
      return null;
    }

    const nextTest = this.tests[nextIndex];
    const nextMetadata = this.testMetadata.get(nextIndex) || { index: nextIndex }

    return { test: nextTest, metadata: nextMetadata };
  }
}

