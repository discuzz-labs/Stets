import { SpyCall, SpyException } from "./Spy.js";

/**
 * Represents a mock function with call tracking, return value tracking, and spy capabilities.
 * 
 * @template T The type of the function being mocked.
 * @since v1.0.0
 */
export type MockFunction<T extends (...args: any[]) => any> = T & {
  /**
   * Array of `this` instances captured during calls to the mock function.
   * 
   * @since v1.0.0
   */
  instances: any[];

  /**
   * Sets the mock to always return the specified value when called.
   * 
   * @param value The value to return.
   * @returns The updated mock function.
   * @since v1.0.0
   */
  andReturn(value: ReturnType<T>): MockFunction<T>;

  /**
   * Sets the mock to always throw the specified error when called.
   * 
   * @param error The error to throw.
   * @returns The updated mock function.
   * @since v1.0.0
   */
  andThrow(error: Error): MockFunction<T>;

  /**
   * Replaces the implementation of the mock with the specified function.
   * 
   * @param fn The new function implementation.
   * @returns The updated mock function.
   * @since v1.0.0
   */
  mockImplementation(fn: T): MockFunction<T>;

  /**
   * Restores the mock to its initial state and implementation.
   * 
   * @since v1.0.0
   */
  mockRestore(): void;

  /**
   * Resets the state of the mock function (clears calls, return values, and exceptions).
   * 
   * @since v1.0.0
   */
  mockReset(): void;

  /**
   * Clears the call history of the mock without resetting its implementation.
   * 
   * @since v1.0.0
   */
  mockClear(): void;

  /**
   * Array of calls made to the mock function, each containing arguments, timestamp, and result.
   * 
   * @since v1.0.0
   */
  calls: Array<SpyCall<Parameters<T>, ReturnType<T>>>;

  /**
   * Array of values returned by the mock function during its calls.
   * 
   * @since v1.0.0
   */
  returnValues: ReturnType<T>[];

  /**
   * Array of exceptions thrown by the mock function during its calls.
   * 
   * @since v1.0.0
   */
  exceptions: SpyException[];

  /**
   * The total number of times the mock function has been called.
   * 
   * @since v1.0.0
   */
  callCount: number;

  /**
   * Returns all calls made to the mock function.
   * 
   * @returns A readonly array of calls.
   * @since v1.0.0
   */
  getCalls(): ReadonlyArray<SpyCall<Parameters<T>, ReturnType<T>>>;

  /**
   * Returns the call information for a specific call index.
   * 
   * @param index The index of the call to retrieve.
   * @returns The call information, or `undefined` if the index is out of range.
   * @since v1.0.0
   */
  getCall(index: number): SpyCall<Parameters<T>, ReturnType<T>> | undefined;

  /**
   * Returns the most recent call made to the mock function.
   * 
   * @returns The latest call information, or `undefined` if no calls have been made.
   * @since v1.0.0
   */
  getLatestCall(): SpyCall<Parameters<T>, ReturnType<T>> | undefined;

  /**
   * Returns the total number of calls made to the mock function.
   * 
   * @returns The call count.
   * @since v1.0.0
   */
  getCallCount(): number;

  /**
   * Returns all arguments passed to the mock function during its calls.
   * 
   * @returns A readonly array of arguments for all calls.
   * @since v1.0.0
   */
  getAllArgs(): ReadonlyArray<Parameters<T>>;

  /**
   * Returns the arguments passed to the mock function for a specific call index.
   * 
   * @param index The index of the call to retrieve arguments for.
   * @returns The arguments, or `undefined` if the index is out of range.
   * @since v1.0.0
   */
  getArgsForCall(index: number): Parameters<T> | undefined;

  /**
   * Returns all return values of the mock function.
   * 
   * @returns A readonly array of return values.
   * @since v1.0.0
   */
  getReturnValues(): ReadonlyArray<ReturnType<T>>;

  /**
   * Returns all exceptions thrown by the mock function.
   * 
   * @returns A readonly array of exceptions.
   * @since v1.0.0
   */
  getExceptions(): ReadonlyArray<SpyException>;

  /**
   * Checks if the mock function was called at least once.
   * 
   * @returns `true` if the function was called, `false` otherwise.
   * @since v1.0.0
   */
  wasCalled(): boolean;

  /**
   * Checks if the mock function was called with specific arguments.
   * 
   * @param args The arguments to match.
   * @returns `true` if a call matches the specified arguments, `false` otherwise.
   * @since v1.0.0
   */
  wasCalledWith(...args: Parameters<T>): boolean;

  /**
   * Checks if the mock function was called a specific number of times.
   * 
   * @param n The expected number of calls.
   * @returns `true` if the function was called `n` times, `false` otherwise.
   * @since v1.0.0
   */
  wasCalledTimes(n: number): boolean;
};

/**
 * Utility class for creating mock functions with spy capabilities.
 */
export class Mock {
  /**
   * Creates a new mock function with optional initial implementation.
   * 
   * @param implementation Optional function implementation to mock.
   * @returns A new mock function.
   */
  static fn<T extends (...args: any[]) => any>(
    implementation?: T,
  ): MockFunction<T>;

  /**
   * Checks if the given value is a mocked function.
   * 
   * @param value The value to check.
   * @returns `true` if the value is a mocked function, `false` otherwise.
   */
  static isMocked(value: unknown): value is MockFunction<any>;
}