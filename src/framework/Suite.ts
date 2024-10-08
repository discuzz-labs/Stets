/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestFunction, Test } from "../types";

/**
 * Represents a test suite that allows defining and running tests.
 */
export class Suite {
  public description: string = ""
  public tests: Test[] = [];
  
  public beforeAllFn: TestFunction = async () => {};
  public afterAllFn: TestFunction = async () => {};
  public beforeEachFn: TestFunction = async () => {};
  public afterEachFn: TestFunction = async () => {};
  
  /**
   * Creates a new test suite instance.
   * @param description - A description of the test suite.
   */
  constructor(description: string) {
    this.description = description
  }

  /**
   * Sets a function to be run before all tests in the suite.
   * @param fn - The function to run before all tests.
   * @returns The current instance of Suite for chaining.
   */
  beforeAll(fn: TestFunction): this {
    this.beforeAllFn = fn;
    return this;
  }

  /**
   * Sets a function to be run after all tests in the suite.
   * @param fn - The function to run after all tests.
   * @returns The current instance of Suite for chaining.
   */
  afterAll(fn: TestFunction): this {
    this.afterAllFn = fn;
    return this;
  }

  /**
   * Sets a function to be run before each test in the suite.
   * @param fn - The function to run before each test.
   * @returns The current instance of Suite for chaining.
   */
  beforeEach(fn: TestFunction): this {
    this.beforeEachFn = fn;
    return this;
  }

  /**
   * Sets a function to be run after each test in the suite.
   * @param fn - The function to run after each test.
   * @returns The current instance of Suite for chaining.
   */
  afterEach(fn: TestFunction): this {
    this.afterEachFn = fn;
    return this;
  }

  /**
   * Adds a test to the suite.
   * @param description - A description of the test.
   * @param fn - The function to run as the test.
   * @returns The current instance of Suite for chaining.
   */
  it(description: string, fn: TestFunction): this {
    this.tests.push({ description, fn });
    return this;
  }
}