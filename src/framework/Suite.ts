/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestFunction, Test } from "../types";
import { TestFailedError } from "../lib/TestError";
import { Reporter } from "../lib/Reporter";
import { Log } from "../utils/Log";

/**
 * Represents a test suite that allows defining and running tests.
 */
export class Suite {
  public tests: Test[] = [];
  public errors: string[] = [];
  public beforeAllFn: TestFunction = async () => {};
  public afterAllFn: TestFunction = async () => {};
  public beforeEachFn: TestFunction = async () => {};
  public afterEachFn: TestFunction = async () => {};

  private startTime: number = 0;
  private endTime: number = 0;

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
   * Starts the timer for measuring the suite duration.
   */
  private startTimer(): void {
    this.startTime = Date.now();
  }

  /**
   * Stops the timer and calculates the end time.
   */
  private stopTimer(): void {
    this.endTime = Date.now();
  }

  /**
   * Gets the duration of the suite run in milliseconds.
   * @returns {number} The total duration in milliseconds.
   */
  private getDuration(): number {
    return this.endTime - this.startTime;
  }

  /**
   * Runs the tests in the suite, including handling hooks and errors.
   * @returns A promise that resolves when all tests have completed.
   */
  async run(): Promise<void> {
    this.startTimer(); // Start the timer before running the suite

    try {
      await this.beforeAllFn();

      await Promise.all(
        this.tests.map(async (test) => {
          try {
            await this.beforeEachFn();
            await test.fn();
            await this.afterEachFn();
          } catch (error: any) {
            const trace = error instanceof TestFailedError 
              ? await error.stackTrace()
              : await new TestFailedError({
                  description: test.description,
                  message: error.message,
                  stack: error.stack,
                }).stackTrace();

            this.errors.push(Reporter.onTestFailed({
              description: test.description,
              error: error.message,
              ...trace
            }));
          }
        })
      );

      await this.afterAllFn();
      this.stopTimer(); // Stop the timer after running the suite
      this.reportResults();
    } catch (error: any) {
      this.reportResults(true);
    }
  }

  private reportResults(isError: boolean = false) {
    const duration = this.getDuration();
    
    if (isError || this.errors.length > 0) {
      Log.error(`Suite ${this.description} in ${__filename} failed with ${this.errors.length} error in ${duration}ms`)
      console.log(Reporter.onSuiteFailed({
        description: this.description,
        error: this.errors.join("\n"),
        duration,
      }));
      process.exitCode = 1;
    } else {
      Log.error(`Suite ${this.description} in ${__filename} succeeded with in ${duration}ms`)
      console.log(Reporter.onSuiteSuccess({
        description: this.description,
        duration,
      }));
      process.exitCode = 0;
    }
  }
}