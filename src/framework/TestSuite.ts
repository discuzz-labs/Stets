/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestFunction, TestConfig } from "../types"

/**
 * Represents a test suite that allows defining and running tests.
 */
export class TestSuite {
  private tests: Map<string, TestConfig> = new Map();
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
   * @param name - A unique name for the test, used for dependency management.
   * @param description - A description of the test.
   * @param fn - The function to run as the test.
   * @param dependencies - An array of test names that this test depends on.
   * @returns The current instance of TestSuite for chaining.
   * @throws An error if a test with the same name already exists.
   */
  it(name: string, description: string, fn: TestFunction, dependencies: string[] = []): this {
    if (this.tests.has(name)) {
      throw new Error(`Test with name "${name}" already exists.`);
    }
    this.tests.set(name, { name, description, fn, dependencies });

    return this;
  }

  /**
   * Resolves dependencies and orders tests to run in the correct sequence.
   * @param tests - An array of test configurations.
   * @returns A promise that resolves to an array of ordered test configurations.
   * @throws An error if circular dependencies are detected.
   */
  private async resolveDependencies(tests: TestConfig[]): Promise<TestConfig[]> {
    const testMap = new Map(tests.map(test => [test.name, test]));
    const resolvedTests: TestConfig[] = [];
    const unresolved = new Set(tests.map(test => test.name));
    const resolvedSet = new Set<string>();

    const resolveTest = async (test: TestConfig, path: Set<string>) => {
      if (resolvedSet.has(test.name)) return;

      if (path.has(test.name)) {
        throw new Error(`Circular dependency detected for test "${test.name}".`);
      }

      path.add(test.name);

      // Resolve dependencies first
      for (const dep of test.dependencies) {
        const depTest = testMap.get(dep);
        if (depTest) await resolveTest(depTest, path);
      }

      path.delete(test.name);
      resolvedSet.add(test.name);
      resolvedTests.push(test);
    };

    for (const test of tests) {
      await resolveTest(test, new Set());
    }

    return resolvedTests;
  }

  /**
   * Runs the tests in the suite, including handling dependencies and hooks.
   * @returns A promise that resolves when all tests have completed.
   */
  async run(): Promise<void> {
    try {
      // Run beforeAll hook
      if (this.beforeAllFn) await this.beforeAllFn();

      // Resolve and run tests with dependencies
      const resolvedTests = await this.resolveDependencies(Array.from(this.tests.values()));
      const testPromises = resolvedTests.map(async (test) => {
        try {
          if (this.beforeEachFn) await this.beforeEachFn();
          await test.fn();
          if (this.afterEachFn) await this.afterEachFn();
          console.log(`✔️ ${test.description}`);
        } catch (error) {
          console.error(`❌ ${test.description}`);
          console.error(error);
        }
      });

      await Promise.all(testPromises);

      // Run afterAll hook
      if (this.afterAllFn) await this.afterAllFn();
    } catch (error) {
      console.error("Error running suite:", error);
    }
  }
}
