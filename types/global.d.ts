import { HookFunction, Options, TestFunction, TestReport } from ".";

declare global {
  /**
   * Updates the description of the test case.
   * @param description - The new description for the test case.
   */
  function should(description: string): void;

  /**
   * Defines a benchmark test.
   * @param description - The description of the test.
   * @param fn - The function to benchmark.
   * @param options - Additional test options.
   */
  function bench(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a parameterized test for each entry in the provided table.
   * @param table - An array of test data.
   * @param description - The description template.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function each(
    table: any[],
    description: string,
    fn: (...args: any[]) => void | Promise<void>,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a standard test.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function it(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a test to run in sequence.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function sequence(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a test with retry logic.
   * @param retry - The number of retries.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function retry(
    retry: number,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Defines a test with a timeout.
   * @param timeout - The timeout in milliseconds.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function timeout(
    timeout: number,
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Adds a todo test.
   * @param description - The description of the test.
   * @param options - Additional test options.
   */
  function todo(description: string, options?: Partial<Options>): void;

  /**
   * Conditionally runs a test if the condition is met.
   * @param condition - A boolean or function returning a boolean.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function itIf(
    condition:
      | boolean
      | undefined
      | null
      | (() => boolean | Promise<boolean> | null | undefined),
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Marks a test to allow soft failures.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function fail(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Marks a test to run exclusively.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function only(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Skips a test.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   */
  function skip(
    description: string,
    fn: TestFunction,
    options?: Partial<Options>,
  ): void;

  /**
   * Adds a 'beforeAll' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   */
  function beforeAll(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Adds a 'beforeEach' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   */
  function beforeEach(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Adds an 'afterAll' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   */
  function afterAll(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Adds an 'afterEach' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   */
  function afterEach(fn: HookFunction, options?: Partial<Options>): void;

  /**
   * Runs the test case and returns a test report.
   * @returns {Promise<TestReport>} The test report after execution.
   */
  function run(): Promise<TestReport>;
}

export {};
