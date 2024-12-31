/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { isDeepStrictEqual } from "util";
import { getType } from "../utils/index.js";

/**
 * Utility type that extracts the names of all methods (functions) in a given type `T`.
 *
 * @template T - The type from which method names are to be extracted.
 */
export type MethodNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

/**
 * A type that combines a function `T` with a `TrackFn` interface or type.
 * This can be used to create a tracked function that includes additional properties or methods.
 *
 * @template T - The type of the function to be tracked.
 */
export type TrackedFunction<T extends (...args: any[]) => any> = T & TrackFn;

/**
 * Utility type that extracts the type of a specific method from a type `T` given the method's key `K`.
 * If the key `K` does not correspond to a function, it returns `never`.
 *
 * @template T - The type from which the method type is extracted.
 * @template K - The key of the method whose type is to be extracted.
 */
export type MethodType<T, K extends keyof T> = T[K] extends (
  ...args: any[]
) => any
  ? T[K]
  : never;

/**
 * Interface representing a tracking function with utilities for inspecting calls, arguments, and results.
 * @template T - The arguments of the tracked function, defaults to any[].
 * @template R - The return type of the tracked function, defaults to any.
 */
export interface TrackFn {
  /**
   * Retrieves the arguments passed to all function calls
   * @returns {ReadonlyArray<any[]>} An array of argument arrays for each call
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.getAllArgs()
   */
  getAllArgs(): ReadonlyArray<any[]>;

  /**
   * Retrieves the arguments passed to a specific function call by index
   * @param {number} index - The index of the function call
   * @returns {any[] | undefined} The arguments of the specified call, or `undefined` if not found
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.getArgsForCall(1)
   */
  getArgsForCall(index: number): any[] | undefined;

  /**
   * Retrieves the return values of all function calls
   * @returns {ReadonlyArray<any>} An array of return values for each call
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.getReturnValues()
   */
  getReturnValues(): ReadonlyArray<any>;

  /**
   * Retrieves the exceptions thrown during function calls
   * @returns {ReadonlyArray<FunctionException>} An array of thrown exceptions
   *
   * @example
   * const throwError = () => { throw new Error('Test error') }
   * const trackFn = Fn(throwError)
   * trackFn.getExceptions()
   */
  getExceptions(): ReadonlyArray<FunctionException>;

  /**
   * Checks if the tracked function was called at least once
   * @returns {boolean} `true` if the function was called, otherwise `false`
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.wasCalled()
   */
  wasCalled(): boolean;

  /**
   * Checks if the tracked function was called with specific arguments
   * @param {...any[]} args - The arguments to check
   * @returns {boolean} `true` if the function was called with the specified arguments, otherwise `false`
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.wasCalledWith(1, 2)
   */
  wasCalledWith(...args: any[]): boolean;

  /**
   * Checks if the tracked function was called a specific number of times
   * @param {number} n - The number of calls to check
   * @returns {boolean} `true` if the function was called exactly `n` times, otherwise `false`
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.wasCalledTimes(2)
   */
  wasCalledTimes(n: number): boolean;

  /**
   * Sets the return value for the tracked function
   * @param {any} value - The value to be returned
   * @returns {TrackFn} The updated tracked function with the configured return value
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.return(5)
   */
  return(value: any): TrackFn;

  /**
   * Configures the tracked function to throw a specific error
   * @param {Error} error - The error to be thrown
   * @returns {TrackFn} The updated tracked function with the configured error
   *
   * @example
   * const throwError = () => { throw new Error('Test error') }
   * const trackFn = Fn(throwError)
   * trackFn.throw(new Error('Custom error'))
   */
  throw(error: Error): TrackFn;

  /**
   * Replaces the tracked function with a custom implementation
   * @param {Function} fn - The custom function to be used
   * @returns {TrackFn} The updated tracked function with the custom implementation
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.use((a, b) => a * b)
   */
  use(fn: (...args: any[]) => any): TrackFn;

  /**
   * Resets the state of the tracked function, clearing all recorded calls, arguments, and results
   * @returns {TrackFn} The reset tracked function
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.reset()
   */
  reset(): TrackFn;

  /**
   * Clears all recorded calls and arguments but retains custom behavior configurations
   * @returns {TrackFn} The cleared tracked function with retained behavior configurations
   *
   * @example
   * const add = (a, b) => a + b
   * const trackFn = Fn(add)
   * trackFn.clear()
   */
  clear(): TrackFn;
}

export interface FunctionCall {
  args: any[];
  timestamp: Date;
  result: any;
}

export interface FunctionException {
  error: Error;
  timestamp: Date;
}

export class TrackFn implements TrackFn {
  private _calls: FunctionCall[] = [];
  private _returnValues: any[] = [];
  private _exceptions: FunctionException[] = [];
  private _callCount = 0;
  private _instances: any[] = [];

  constructor(private _implementation: Function) {}

  // Method to track the behavior of the function
  track = (): Function => {
    const self = this;

    // Create the tracked function
    const trackedFunction: any = function (this: any, ...args: any[]): any {
      try {
        const result = self._implementation.apply(this, args);
        self.recordCall(args, result, this);
        return result;
      } catch (error) {
        const normalizedError =
          getType(error) === "error" ? error : new Error(String(error));
        self.recordException(normalizedError as Error);
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
  private recordCall(args: any[], result: any, thisArg?: any): void {
    const call: FunctionCall = { args, timestamp: new Date(), result };
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
  reset(): TrackFn {
    this._calls = [];
    this._returnValues = [];
    this._exceptions = [];
    this._callCount = 0;
    this._instances = [];

    return this;
  }

  // Methods to manipulate the tracked function behavior
  returns(value: any): TrackFn {
    this._implementation = () => value;
    return this;
  }

  throws(error: Error): TrackFn {
    this._implementation = () => {
      throw error;
    };
    return this;
  }

  use(fn: Function): TrackFn {
    this._implementation = fn;
    return this;
  }

  // Tracking methods
  getCalls(): ReadonlyArray<FunctionCall> {
    return this._calls;
  }

  getCall(index: number): FunctionCall | undefined {
    return this._calls[index];
  }

  getLatestCall(): FunctionCall | undefined {
    return this._calls[this._calls.length - 1];
  }

  getCallCount(): number {
    return this._callCount;
  }

  getAllArgs(): ReadonlyArray<any[]> {
    return this._calls.map((call) => call.args);
  }

  getArgsForCall(index: number): any[] | undefined {
    return this._calls[index]?.args;
  }

  getReturnValues(): ReadonlyArray<any> {
    return this._returnValues;
  }

  getExceptions(): ReadonlyArray<FunctionException> {
    return this._exceptions;
  }

  wasCalled(): boolean {
    return this._callCount > 0;
  }

  wasCalledWith(...args: any[]): boolean {
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

/**
 * Creates a tracked version of a given function, preserving its original type signature while
 * adding tracking capabilities. The returned function maintains the same behavior as the original
 * while providing additional methods for tracking calls, arguments, and results.
 *
 * @template T - The type of the function being tracked, must extend (...args: any[]) => any
 * @param {T} implementation - The original function implementation to track
 * @returns {TrackedFunction<T>} A function that combines the original implementation with tracking capabilities
 *
 * @example
 * // Track a simple addition function
 * const add = (a: number, b: number) => a + b;
 * const trackedAdd = Fn(add);
 * trackedAdd(1, 2); // Returns 3
 * console.log(trackedAdd.getCallCount()); // Returns 1
 */
export function Fn<T extends (...args: any[]) => any>(
  implementation: T,
): TrackedFunction<T> {
  return new TrackFn(implementation).track() as TrackedFunction<T>;
}

/**
 * Replaces a method on an object with a tracked version while preserving its original type signature.
 * The original method is replaced with a tracked version that maintains the same behavior but provides
 * additional tracking capabilities. The tracked version is both assigned to the object and returned
 * for convenience.
 *
 * @template T - The type of the object containing the method to track
 * @template K - The key type of the method to track, must be a key of T
 * @param {T} obj - The object containing the method to track
 * @param {K & MethodNames<T>} method - The name of the method to track
 * @returns {TrackedFunction<MethodType<T, K>>} A tracked version of the specified method
 * @throws {Error} If the specified method doesn't exist on the object or isn't a function
 *
 * @example
 * // Track a method on a simple object
 * const calculator = {
 *   add: (a: number, b: number) => a + b
 * };
 * const trackedAdd = spyOn(calculator, 'add');
 * calculator.add(2, 3); // Returns 5
 * console.log(trackedAdd.getCallCount()); // Returns 1
 */
export function spyOn<T extends object, K extends keyof T>(
  obj: T,
  method: K & MethodNames<T>,
): TrackedFunction<MethodType<T, K>> {
  if (!obj || typeof obj[method] !== "function") {
    throw new Error(`Method '${String(method)}' not found on the object.`);
  }

  const originalMethod = obj[method] as MethodType<T, K>;
  const trackedFn = Fn(originalMethod);

  // Type assertion needed since we validated the method exists
  obj[method] = trackedFn as any;

  return trackedFn;
}
