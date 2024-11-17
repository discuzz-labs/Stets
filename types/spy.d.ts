/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export interface SpyCall<T extends any[] = any[], R = any> {
  args: T;
  timestamp: Date;
  result: R;
}

export interface SpyException {
  error: Error;
  timestamp: Date;
}

/**
 * Spy on functions and methods, capturing arguments, return values, exceptions, and call counts.
 * @template T The type of arguments the spied function accepts.
 * @template R The type of value the spied function returns.
 */
export class SpyInstance<T extends any[] = any[], R = any> {
  /**
   * Spy on an existing object's method.
   * @param obj The object containing the method to spy on.
   * @param methodName The name of the method to spy on.
   * @returns {Spy<T, R>} A new `Spy` instance for the specified method.
   * @template TObj The type of the object.
   * @template TMethod The type of the method to spy on.
   * @since v1.0.0
   * @example
   * const spy = Spy.spyOn(someObject, 'someMethod');
   */
  static spyOn<TObj extends object, TMethod extends keyof TObj>(
    obj: TObj,
    methodName: TMethod,
  ): SpyInstance<
    TObj[TMethod] extends (...args: infer P) => any ? P : never,
    TObj[TMethod] extends (...args: any[]) => infer Q ? Q : never
  >;

  /**
   * Record a function call with arguments and result.
   * @param args The arguments passed to the function.
   * @param result The result returned by the function.
   * @since v1.0.0
   */
  private recordCall(args: T, result: R): void;

  /**
   * Record an exception thrown by the function.
   * @param error The error that was thrown.
   * @since v1.0.0
   */
  private recordException(error: Error): void;

  /**
   * Get all calls made to the spied function.
   * @returns {ReadonlyArray<SpyCall<T, R>>} An array of all recorded calls.
   * @since v1.0.0
   * @example
   * const calls = spy.getCalls();
   */
  getCalls(): ReadonlyArray<SpyCall<T, R>>;

  /**
   * Get a specific call by its index.
   * @param index The index of the call.
   * @returns {SpyCall<T, R> | undefined} The recorded call, or `undefined` if the call doesn't exist.
   * @since v1.0.0
   * @example
   * const call = spy.getCall(0);
   */
  getCall(index: number): SpyCall<T, R> | undefined;

  /**
   * Get the latest call to the spied function.
   * @returns {SpyCall<T, R> | undefined} The latest recorded call, or `undefined` if no calls were made.
   * @since v1.0.0
   * @example
   * const latestCall = spy.getLatestCall();
   */
  getLatestCall(): SpyCall<T, R> | undefined;

  /**
   * Get the total number of calls to the spied function.
   * @returns {number} The number of times the function was called.
   * @since v1.0.0
   * @example
   * const callCount = spy.getCallCount();
   */
  getCallCount(): number;

  /**
   * Get all arguments passed to the spied function across all calls.
   * @returns {ReadonlyArray<T>} An array of all arguments passed to the function.
   * @since v1.0.0
   * @example
   * const allArgs = spy.getAllArgs();
   */
  getAllArgs(): ReadonlyArray<T>;

  /**
   * Get the arguments for a specific call.
   * @param index The index of the call.
   * @returns {T | undefined} The arguments for the call, or `undefined` if the call doesn't exist.
   * @since v1.0.0
   * @example
   * const args = spy.getArgsForCall(0);
   */
  getArgsForCall(index: number): T | undefined;

  /**
   * Get all return values from the spied function.
   * @returns {ReadonlyArray<R>} An array of all return values from the function.
   * @since v1.0.0
   * @example
   * const returnValues = spy.getReturnValues();
   */
  getReturnValues(): ReadonlyArray<R>;

  /**
   * Get all exceptions thrown by the spied function.
   * @returns {ReadonlyArray<SpyException>} An array of all exceptions thrown by the function.
   * @since v1.0.0
   * @example
   * const exceptions = spy.getExceptions();
   */
  getExceptions(): ReadonlyArray<SpyException>;

  /**
   * Check if the spied function was called.
   * @returns {boolean} `true` if the function was called, otherwise `false`.
   * @since v1.0.0
   * @example
   * const wasCalled = spy.wasCalled();
   */
  wasCalled(): boolean;

  /**
   * Check if the spied function was called with specific arguments.
   * @param args The arguments to check for.
   * @returns {boolean} `true` if the function was called with the specified arguments, otherwise `false`.
   * @since v1.0.0
   * @example
   * const wasCalledWith = spy.wasCalledWith(1, 2, 3);
   */
  wasCalledWith(...args: T): boolean;

  /**
   * Check if the spied function was called exactly `n` times.
   * @param n The number of times to check for.
   * @returns {boolean} `true` if the function was called exactly `n` times, otherwise `false`.
   * @since v1.0.0
   * @example
   * const wasCalledTimes = spy.wasCalledTimes(2);
   */
  wasCalledTimes(n: number): boolean;

  /**
   * Reset all recorded data for the spy.
   * @since v1.0.0
   * @example
   * spy.reset();
   */
  reset(): void;
}
