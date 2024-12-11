/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { isDeepStrictEqual } from "util";

/**
 * Interface representing a tracking function with utilities for inspecting calls, arguments, and results.
 * @template T - The arguments of the tracked function, defaults to any[].
 * @template R - The return type of the tracked function, defaults to any.
 */
export interface TrackFn<T extends any[] = any[], R = any> {
  /**
   * Retrieves all the function calls made to the tracked function.
   * @returns {ReadonlyArray<FunctionCall<T, R>>} An array of recorded function calls.
   * @example trackFn.getCalls();
   */
  getCalls(): ReadonlyArray<FunctionCall<T, R>>;

  /**
   * Retrieves a specific function call by index.
   * @param {number} index - The index of the function call.
   * @returns {FunctionCall<T, R> | undefined} The function call at the specified index, or undefined if not found.
   * @example trackFn.getCall(0);
   */
  getCall(index: number): FunctionCall<T, R> | undefined;

  /**
   * Retrieves the most recent function call made to the tracked function.
   * @returns {FunctionCall<T, R> | undefined} The latest function call, or undefined if no calls have been made.
   * @example trackFn.getLatestCall();
   */
  getLatestCall(): FunctionCall<T, R> | undefined;

  /**
   * Retrieves the total number of times the tracked function has been called.
   * @returns {number} The total call count.
   * @example trackFn.getCallCount();
   */
  getCallCount(): number;

  /**
   * Retrieves the arguments passed to all function calls.
   * @returns {ReadonlyArray<T>} An array of arguments for each call.
   * @example trackFn.getAllArgs();
   */
  getAllArgs(): ReadonlyArray<T>;

  /**
   * Retrieves the arguments passed to a specific function call by index.
   * @param {number} index - The index of the function call.
   * @returns {T | undefined} The arguments for the specified call, or undefined if not found.
   * @example trackFn.getArgsForCall(1);
   */
  getArgsForCall(index: number): T | undefined;

  /**
   * Retrieves the return values of all function calls.
   * @returns {ReadonlyArray<R>} An array of return values.
   * @example trackFn.getReturnValues();
   */
  getReturnValues(): ReadonlyArray<R>;

  /**
   * Retrieves the exceptions thrown during function calls.
   * @returns {ReadonlyArray<FunctionException>} An array of thrown exceptions.
   * @example trackFn.getExceptions();
   */
  getExceptions(): ReadonlyArray<FunctionException>;

  /**
   * Checks if the tracked function was called at least once.
   * @returns {boolean} True if the function was called, otherwise false.
   * @example trackFn.wasCalled();
   */
  wasCalled(): boolean;

  /**
   * Checks if the tracked function was called with specific arguments.
   * @param {...T} args - The arguments to check.
   * @returns {boolean} True if the function was called with the specified arguments, otherwise false.
   * @example trackFn.wasCalledWith('arg1', 'arg2');
   */
  wasCalledWith(...args: T): boolean;

  /**
   * Checks if the tracked function was called a specific number of times.
   * @param {number} n - The number of calls to check.
   * @returns {boolean} True if the function was called exactly n times, otherwise false.
   * @example trackFn.wasCalledTimes(3);
   */
  wasCalledTimes(n: number): boolean;

  /**
   * Sets the return value for the tracked function.
   * @param {R} value - The value to be returned.
   * @returns {TrackFn<T, R>} The updated tracked function.
   * @example trackFn.return('value');
   */
  return(value: R): TrackFn<T, R>;

  /**
   * Configures the tracked function to throw a specific error.
   * @param {Error} error - The error to be thrown.
   * @returns {TrackFn<T, R>} The updated tracked function.
   * @example trackFn.throw(new Error('Something went wrong'));
   */
  throw(error: Error): TrackFn<T, R>;

  /**
   * Replaces the tracked function with a custom implementation.
   * @template F - The custom function type.
   * @param {F} fn - The custom function to use.
   * @returns {TrackFn<T, R>} The updated tracked function.
   * @example trackFn.use((arg1, arg2) => arg1 + arg2);
   */
  use<F extends (...args: any[]) => any>(fn: F): TrackFn<T, R>;

  /**
   * Resets the state of the tracked function, clearing all recorded calls, arguments, and results.
   * @returns {TrackFn<T, R>} The reset tracked function.
   * @example trackFn.reset();
   */
  reset(): TrackFn<T, R>;

  /**
   * Clears all recorded calls and arguments but retains custom behavior configurations.
   * @returns {TrackFn<T, R>} The cleared tracked function.
   * @example trackFn.clear();
   */
  clear(): TrackFn<T, R>;
}

export interface FunctionCall<T extends any[], R> {
  args: T;
  timestamp: Date;
  result: R;
}

export interface FunctionException {
  error: Error;
  timestamp: Date;
}

export class TrackFn<T extends any[], R> {
  private _calls: FunctionCall<T, R>[] = [];
  private _returnValues: R[] = [];
  private _exceptions: FunctionException[] = [];
  private _callCount = 0;
  private _instances: any[] = [];

  constructor(private _implementation: (...args: T) => R) {}

  // Method to track the behavior of the function
  track = (): ((...args: T) => R) => {
    const self = this;

    // Create the tracked function
    const trackedFunction: any = function (this: any, ...args: T): R {
      try {
        const result = self._implementation.apply(this, args);
        self.recordCall(args, result, this);
        return result;
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        self.recordException(normalizedError);
        throw normalizedError;
      }
    };

    // Attach chainable tracking and behavior-modifying methods
    trackedFunction.return = self.returns.bind(self);
    trackedFunction.throw = self.throws.bind(self);
    trackedFunction.use = self.use.bind(self);
    trackedFunction.reset = self.reset.bind(self);
    trackedFunction.clear = self.reset.bind(self);

    // Attach tracking methods
    trackedFunction.getCalls = self.getCalls.bind(self);
    trackedFunction.getCall = self.getCall.bind(self);
    trackedFunction.getLatestCall = self.getLatestCall.bind(self);
    trackedFunction.getCallCount = self.getCallCount.bind(self);
    trackedFunction.getAllArgs = self.getAllArgs.bind(self);
    trackedFunction.getArgsForCall = self.getArgsForCall.bind(self);
    trackedFunction.getReturnValues = self.getReturnValues.bind(self);
    trackedFunction.getExceptions = self.getExceptions.bind(self);
    trackedFunction.wasCalled = self.wasCalled.bind(self);
    trackedFunction.wasCalledWith = self.wasCalledWith.bind(self);
    trackedFunction.wasCalledTimes = self.wasCalledTimes.bind(self);

    return trackedFunction;
  };

  // Method to record calls
  private recordCall(args: T, result: R, thisArg?: any): void {
    const call: FunctionCall<T, R> = { args, timestamp: new Date(), result };
    this._calls.push(call);
    this._returnValues.push(result);
    this._callCount++;
    this._instances.push(thisArg);
  }

  // Method to record exceptions
  private recordException(error: Error): void {
    this._exceptions.push({ error, timestamp: new Date() });
  }

  // Method to reset tracking
  reset(): TrackFn<T, R> {
    this._calls = [];
    this._returnValues = [];
    this._exceptions = [];
    this._callCount = 0;
    this._instances = [];

    return this;
  }

  // Methods to manipulate the tracked function behavior
  returns(value: R): TrackFn<T, R> {
    this._implementation = () => value;
    return this;
  }

  throws(error: Error): TrackFn<T, R> {
    this._implementation = () => {
      throw error;
    };
    return this;
  }

  use<F extends (...args: any[]) => any>(fn: F): TrackFn<T, R> {
    this._implementation = fn;
    return this;
  }

  // Tracking methods
  getCalls(): ReadonlyArray<FunctionCall<T, R>> {
    return this._calls;
  }

  getCall(index: number): FunctionCall<T, R> | undefined {
    return this._calls[index];
  }

  getLatestCall(): FunctionCall<T, R> | undefined {
    return this._calls[this._calls.length - 1];
  }

  getCallCount(): number {
    return this._callCount;
  }

  getAllArgs(): ReadonlyArray<T> {
    return this._calls.map((call) => call.args);
  }

  getArgsForCall(index: number): T | undefined {
    return this._calls[index]?.args;
  }

  getReturnValues(): ReadonlyArray<R> {
    return this._returnValues;
  }

  getExceptions(): ReadonlyArray<FunctionException> {
    return this._exceptions;
  }

  wasCalled(): boolean {
    return this._callCount > 0;
  }

  wasCalledWith(...args: T): boolean {
    return this._calls.some(
      (call) =>
        call.args.length === args.length &&
        call.args.every((arg, index) => isDeepStrictEqual(arg, args[index])),
    );
  }

  wasCalledTimes(n: number): boolean {
    return this._callCount === n;
  }
}

/**
 * Creates a tracked version of a given function.
 *
 * @template T - The argument types of the function.
 * @template R - The return type of the function.
 * @param {(...args: T) => R} implementation - The original function implementation.
 * @returns {(...args: T) => R} A tracked version of the provided function.
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * const trackedAdd = Fn(add);
 * trackedAdd(1, 2); // 3
 */
export function Fn<T extends any[], R>(
  implementation: (...args: T) => R,
): (...args: T) => R {
  return new TrackFn(implementation).track();
}

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
export function spy<T extends any[], R>(
  obj: { [key: string]: (...args: T) => R },
  method: string,
) {
  if (!obj || typeof obj[method] !== "function") {
    throw new Error(`Method '${method}' not found on the object.`);
  }

  // Get the original method
  const originalMethod = obj[method];

  // Create a tracked version of the method using the Fn function
  const trackedFn = Fn(originalMethod);

  // Replace the original method with the tracked version
  obj[method] = trackedFn;

  return trackedFn;
}

/**
 * Checks if a value is a tracked function.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a tracked function, otherwise false.
 *
 * @example
 * const trackedAdd = Fn((a: number, b: number) => a + b);
 * console.log(isFn(trackedAdd)); // true
 */
export function isFn(value: any): boolean {
  if (typeof value !== "function") return false;
  const methods = [
    "getCalls",
    "getCall",
    "getLatestCall",
    "getCallCount",
    "getAllArgs",
    "getArgsForCall",
    "getReturnValues",
    "getExceptions",
    "wasCalled",
    "wasCalledWith",
    "wasCalledTimes",
    "return",
    "throw",
    "use",
    "reset",
    "clear",
  ];

  return methods.every((method) => typeof value[method] === "function");
}
