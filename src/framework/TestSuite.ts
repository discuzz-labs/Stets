/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestFunction, TestConfig } from "../types"
import { TestFailedError } from '../lib/TestError'; 

/**
 * Represents a test suite that allows defining and running tests.
 */
export class TestSuite {
  private tests: TestConfig[] = [];
  private errors: string[] = [];
  private beforeAllFn: TestFunction = async () => {};
  private afterAllFn: TestFunction = async () => {};
  private beforeEachFn: TestFunction = async () => {};
  private afterEachFn: TestFunction = async () => {};

  /**
   * Creates a new test suite instance.
   * @param description - A description of the test suite.
   */
  constructor(private description: string) {}

  /**
   * Sets a function to be run before all tests in the suite.
   * @param fn - The function to run before all tests.
   * @returns The current instance of TestSuite for chaining.
   */
  beforeAll(fn: TestFunction): this {
    this.beforeAllFn = fn;
    return this;
  }

  /**
   * Sets a function to be run after all tests in the suite.
   * @param fn - The function to run after all tests.
   * @returns The current instance of TestSuite for chaining.
   */
  afterAll(fn: TestFunction): this {
    this.afterAllFn = fn;
    return this;
  }

  /**
   * Sets a function to be run before each test in the suite.
   * @param fn - The function to run before each test.
   * @returns The current instance of TestSuite for chaining.
   */
  beforeEach(fn: TestFunction): this {
    this.beforeEachFn = fn;
    return this;
  }

  /**
   * Sets a function to be run after each test in the suite.
   * @param fn - The function to run after each test.
   * @returns The current instance of TestSuite for chaining.
   */
  afterEach(fn: TestFunction): this {
    this.afterEachFn = fn;
    return this;
  }

  /**
   * Adds a test to the suite.
   * @param description - A description of the test.
   * @param fn - The function to run as the test.
   * @returns The current instance of TestSuite for chaining.
   */
  it(description: string, fn: TestFunction): this {
    this.tests.push({ description, fn });
    return this;
  }

  /**
   * Runs the tests in the suite, including handling hooks and errors.
   * @returns A promise that resolves when all tests have completed.
   */
  async run(): Promise<void> {
  
    try {
      // Run beforeAll hook
      await this.beforeAllFn();

      // Run all tests in parallel
      await Promise.all(
        this.tests.map(async (test) => {
          try {
            await this.beforeEachFn(); // Sequential for each test
            await test.fn(); // Parallel execution of tests
            await this.afterEachFn(); // Sequential for each test
          } catch (error: any) {
            // Catch only TestFailedError
            if (error instanceof TestFailedError) {
              this.errors.push(error.logError());
            } else {
              this.errors.push(
                new TestFailedError({
                  errorName: "TestFailedError",
                  testDescription: test.description,
                  message: error.message,
                  stack: error.stack
                }).logError()
              );
            }
          }
        })
      );

      // Run afterAll hook
      await this.afterAllFn();

      // Print all errors if any
      if (this.errors.length > 0) {
        console.error(`\nTest Suite: ${this.description}\n\n${this.errors.join('\n\n')}`);
        process.exit(1);
      }
    } catch (error: any) {
      console.error(`Test Suite: ${this.description} failed to run. Due to: ${error.message}`);
      process.exit(1);
    }
  }
}