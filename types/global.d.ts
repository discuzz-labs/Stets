import {
  Assertion,
  HookFunction,
  Options,
  TestFunction,
  TestReport,
  TrackFn,
} from ".";

declare global {
  /**
   * Updates the description of the test case.
   * @param description - The new description for the test case.
   * @example testCase.should('Updated description');
   */
  function should(description: string): void;
  /**
   * Defines a benchmark test.
   * @param description - The description of the test.
   * @param fn - The function to benchmark.
   * @param options - Additional test options.
   * @example testCase.bench('Measure performance', () => doWork());
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
   * @example
   * testCase.each([[1, 2], [3, 4]], 'adds %d and %d', (a, b) => expect(a + b).toBeGreaterThan(0));
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
   * @example testCase.it('should login successfully', () => login());
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
   * @example testCase.sequence('processes data sequentially', () => processData());
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
   * @example testCase.retry(3, 'retryable test', () => flakyTest());
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
   * @example testCase.timeout(5000, 'should finish within 5 seconds', () => quickTest());
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
   * @example testCase.todo('Implement this later');
   */
  function todo(description: string, options?: Partial<Options>): void;
  /**
   * Conditionally runs a test if the condition is met.
   * @param condition - A boolean or function returning a boolean.
   * @param description - The description of the test.
   * @param fn - The test function.
   * @param options - Additional test options.
   * @example testCase.itIf(true, 'conditionally run this test', () => doTest());
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
   * @example testCase.fail('non-critical test', () => flakyTest());
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
   * @example testCase.only('critical test', () => runCriticalTest());
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
   * @example testCase.skip('skipped test', () => doNotRun());
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
   * @example testCase.beforeAll(() => setup());
   */
  function beforeAll(fn: HookFunction, options?: Partial<Options>): void;
  /**
   * Adds a 'beforeEach' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   * @example testCase.beforeEach(() => setupEach());
   */
  function beforeEach(fn: HookFunction, options?: Partial<Options>): void;
  /**
   * Adds an 'afterAll' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   * @example testCase.afterAll(() => teardown());
   */
  function afterAll(fn: HookFunction, options?: Partial<Options>): void;
  /**
   * Adds an 'afterEach' hook to the test case.
   * @param fn - The hook function.
   * @param options - Additional options.
   * @example testCase.afterEach(() => cleanupEach());
   */
  function afterEach(fn: HookFunction, options?: Partial<Options>): void;
  /**
   * Runs the test case and returns a test report.
   * @returns {Promise<TestReport>} The test report after execution.
   * @example const report = await testCase.run();
   */
  function run(): Promise<TestReport>;

  /**
   * Creates a new assertion instance for the provided value.
   * - This function performs assertions that will **throw an error** if the condition fails.
   * - Use this when you need hard failure handling for invalid conditions.
   *
   * @param {any} received - The value to be asserted.
   * @example
   * assert(42).toBe(42); // Passes
   * assert("hello").toBe("world"); // Throws an error
   * @returns {Assertion} An `Assertion` instance configured to throw errors on failure.
   */
  function assert(received: any): Assertion;

  /**
   * Creates a new assertion instance for the provided value.
   * - This function performs non-throwing assertions, which do not raise errors on failure.
   * - Use this for scenarios where you want to test conditions without interrupting execution.
   *
   * @param {any} received - The value to be strictly asserted.
   * @example
   * is(42).toBe(42); // Passes
   * is("hello").toBe("world"); // Does not throw, but marks failure
   * @returns {Assertion} An `Assertion` instance configured to silently handle failures.
   */
  function is(received: any): Assertion;

  /**
   * Creates a tracked version of a given function.
   * The returned function retains its original call signature and implements the `TrackFn` interface
   * for tracking calls, arguments, results, and more.
   *
   * @template T - The argument types of the function.
   * @template R - The return type of the function.
   * @param {(...args: T) => R} implementation - The original function implementation.
   * @returns {TrackFn<T, R> & ((...args: T) => R)} A tracked version of the provided function,
   * combining the call signature of the original function and tracking capabilities.
   *
   * @example
   * const add = (a: number, b: number) => a + b;
   * const trackedAdd = Fn(add);
   *
   * trackedAdd(1, 2); // 3
   * console.log(trackedAdd.getCalls()); // Logs tracked calls
   * trackedAdd.reset(); // Clears tracked calls
   */
  function Fn<T extends any[], R>(
    implementation: (...args: T) => R,
  ): TrackFn<T, R> & ((...args: T) => R);

  /**
   * Replaces a method on an object with a tracked version of the method.
   *
   * @template T - The argument types of the method.
   * @template R - The return type of the method.
   * @param {{ [key: string]: (...args: T) => R }} obj - The object containing the method.
   * @param {string} method - The name of the method to replace.
   * @returns {(...args: T) => R} The tracked version of the method.
   *
   * @throws {Error} If the method does not exist on the object or is not a function.
   *
   * @example
   * const obj = { multiply: (a: number, b: number) => a * b };
   * const trackedMultiply = spy(obj, 'multiply');
   * obj.multiply(2, 3); // 6
   * console.log(trackedMultiply.getCallCount()); // 1
   */
  function spy<T extends any[], R>(
    obj: {
      [key: string]: (...args: T) => R;
    },
    method: string,
  ): TrackFn<T, R> & ((...args: T) => R);
}

export {};
