/**
 * A type representing a function that tracks its invocations, arguments, return values, and exceptions.
 * The tracked function allows you to modify its behavior and inspect its usage.
 *
 * This type includes methods to track the function calls and manipulate the function’s behavior.
 * The returned tracked function includes chainable methods such as `.return()`, `.throw()`, `.use()`, 
 * `.reset()`, and `.clear()` for controlling and testing its behavior.
 *
 * @template T - The type of the arguments that the tracked function accepts.
 * @template R - The type of the value that the tracked function returns.
 * @since v1.0.0
 */
export interface TrackFn<T extends any[] = any[], R = any> {
  /**
   * Gets all the function calls made to the tracked function.
   *
   * @returns {ReadonlyArray<FunctionCall<T, R>>} An array of objects representing each call with its arguments,
   *                                               return value, and timestamp.
   * @since v1.0.0
   */
  getCalls(): ReadonlyArray<FunctionCall<T, R>>;

  /**
   * Gets a specific call by its index.
   *
   * @param {number} index - The index of the call to retrieve.
   * @returns {FunctionCall<T, R> | undefined} The specific function call or undefined if the index is out of range.
   * @since v1.0.0
   */
  getCall(index: number): FunctionCall<T, R> | undefined;

  /**
   * Gets the most recent call made to the tracked function.
   *
   * @returns {FunctionCall<T, R> | undefined} The most recent function call or undefined if no calls were made.
   * @since v1.0.0
   */
  getLatestCall(): FunctionCall<T, R> | undefined;

  /**
   * Gets the total number of times the tracked function has been called.
   *
   * @returns {number} The total call count.
   * @since v1.0.0
   */
  getCallCount(): number;

  /**
   * Gets all the arguments passed to the function calls.
   *
   * @returns {ReadonlyArray<T>} An array of arrays, where each inner array contains the arguments for a call.
   * @since v1.0.0
   */
  getAllArgs(): ReadonlyArray<T>;

  /**
   * Gets the arguments for a specific call.
   *
   * @param {number} index - The index of the call.
   * @returns {T | undefined} The arguments for the specified call or undefined if the call doesn't exist.
   * @since v1.0.0
   */
  getArgsForCall(index: number): T | undefined;

  /**
   * Gets all the return values from the function calls.
   *
   * @returns {ReadonlyArray<R>} An array of return values corresponding to each function call.
   * @since v1.0.0
   */
  getReturnValues(): ReadonlyArray<R>;

  /**
   * Gets all exceptions thrown by the tracked function during its calls.
   *
   * @returns {ReadonlyArray<FunctionException>} An array of exceptions thrown during function calls.
   * @since v1.0.0
   */
  getExceptions(): ReadonlyArray<FunctionException>;

  /**
   * Checks if the function has been called at least once.
   *
   * @returns {boolean} True if the function was called, false otherwise.
   * @since v1.0.0
   */
  wasCalled(): boolean;

  /**
   * Checks if the function was called with specific arguments.
   *
   * @param {...T} args - The arguments to check for.
   * @returns {boolean} True if the function was called with the given arguments, false otherwise.
   * @since v1.0.0
   */
  wasCalledWith(...args: T): boolean;

  /**
   * Checks if the function was called exactly a certain number of times.
   *
   * @param {number} n - The exact number of calls to check for.
   * @returns {boolean} True if the function was called exactly `n` times, false otherwise.
   * @since v1.0.0
   */
  wasCalledTimes(n: number): boolean;

  /**
   * Changes the return value of the tracked function to a fixed value.
   *
   * @param {R} value - The return value to set.
   * @returns {TrackFn<T, R>} The tracked function instance (for chaining).
   * @since v1.0.0
   */
  return(value: R): TrackFn<T, R>;

  /**
   * Makes the tracked function throw a specific error whenever called.
   *
   * @param {Error} error - The error to throw.
   * @returns {TrackFn<T, R>} The tracked function instance (for chaining).
   * @since v1.0.0
   */
  throw(error: Error): TrackFn<T, R>;

  /**
   * Replaces the tracked function's implementation with a new function.
   *
   * @param {F} fn - The new implementation function to use.
   * @returns {TrackFn<T, R>} The tracked function instance (for chaining).
   * @since v1.0.0
   */
  use<F extends (...args: any[]) => any>(fn: F): TrackFn<T, R>;

  /**
   * Resets the tracking data (calls, return values, exceptions).
   *
   * @returns {TrackFn<T, R>} The tracked function instance (for chaining).
   * @since v1.0.0
   */
  reset(): TrackFn<T, R>;

  /**
   * Clears the tracking data (calls, return values, exceptions).
   *
   * @returns {TrackFn<T, R>} The tracked function instance (for chaining).
   * @since v1.0.0
   */
  clear(): TrackFn<T, R>;
}

/**
 * A type representing a function call to the tracked function.
 *
 * @template T - The type of the arguments passed to the function.
 * @template R - The type of the result returned by the function.
 */
export interface FunctionCall<T extends any[], R> {
  /**
   * The arguments passed to the function during this call.
   * 
   * @type {T}
   */
  args: T;

  /**
   * The timestamp of when the function was called.
   * 
   * @type {Date}
   */
  timestamp: Date;

  /**
   * The result returned by the function during this call.
   * 
   * @type {R}
   */
  result: R;
}

/**
 * Represents an exception thrown during a function call.
 */
export interface FunctionException {
  /**
   * The error that was thrown during the function call.
   */
  error: Error;

  /**
   * The timestamp of when the error occurred.
   */
  timestamp: Date;
}