/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { isDeepStrictEqual } from "util";
import { getType } from "../utils/index.js";

type MethodNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];


/**
 * Interface representing a tracking function with utilities for inspecting calls, arguments, and results.
 * @template T - The arguments of the tracked function, defaults to any[].
 * @template R - The return type of the tracked function, defaults to any.
 */
export interface TrackFn {
  /**
   * Retrieves all the function calls made to the tracked function.
   * @returns {ReadonlyArray<FunctionCall>} An array of recorded function calls.
   * @example trackFn.getCalls();
   */
  getCalls(): ReadonlyArray<FunctionCall>;

  /**
   * Retrieves a specific function call by index.
   * @param {number} index - The index of the function call.
   * @returns {FunctionCall | undefined} The function call at the specified index, or undefined if not found.
   * @example trackFn.getCall(0);
   */
  getCall(index: number): FunctionCall | undefined;

  /**
   * Retrieves the most recent function call made to the tracked function.
   * @returns {FunctionCall | undefined} The latest function call, or undefined if no calls have been made.
   * @example trackFn.getLatestCall();
   */
  getLatestCall(): FunctionCall | undefined;

  /**
   * Retrieves the total number of times the tracked function has been called.
   * @returns {number} The total call count.
   * @example trackFn.getCallCount();
   */
  getCallCount(): number;

  /**
   * Retrieves the arguments passed to all function calls.
   * @returns {ReadonlyArray<any[]>} An array of arguments for each call.
   * @example trackFn.getAllArgs();
   */
  getAllArgs(): ReadonlyArray<any[]>;

  /**
   * Retrieves the arguments passed to a specific function call by index.
   * @param {number} index - The index of the function call.
   * @returns {any[] | undefined} The arguments for the specified call, or undefined if not found.
   * @example trackFn.getArgsForCall(1);
   */
  getArgsForCall(index: number): any[] | undefined;

  /**
   * Retrieves the return values of all function calls.
   * @returns {ReadonlyArray<any>} An array of return values.
   * @example trackFn.getReturnValues();
   */
  getReturnValues(): ReadonlyArray<any>;

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
   * @param {...any[]} args - The arguments to check.
   * @returns {boolean} True if the function was called with the specified arguments, otherwise false.
   * @example trackFn.wasCalledWith('arg1', 'arg2');
   */
  wasCalledWith(...args: any[]): boolean;

  /**
   * Checks if the tracked function was called a specific number of times.
   * @param {number} n - The number of calls to check.
   * @returns {boolean} True if the function was called exactly n times, otherwise false.
   * @example trackFn.wasCalledTimes(3);
   */
  wasCalledTimes(n: number): boolean;

  /**
   * Sets the return value for the tracked function.
   * @param {any} value - The value to be returned.
   * @returns {TrackFn} The updated tracked function.
   * @example trackFn.return('value');
   */
  return(value: any): TrackFn;

  /**
   * Configures the tracked function to throw a specific error.
   * @param {Error} error - The error to be thrown.
   * @returns {TrackFn} The updated tracked function.
   * @example trackFn.throw(new Error('Something went wrong'));
   */
  throw(error: Error): TrackFn;

  /**
   * Replaces the tracked function with a custom implementation.
   * @param {Function} fn - The custom function to use.
   * @returns {TrackFn} The updated tracked function.
   * @example trackFn.use((arg1, arg2) => arg1 + arg2);
   */
  use(fn: Function): TrackFn;

  /**
   * Resets the state of the tracked function, clearing all recorded calls, arguments, and results.
   * @returns {TrackFn} The reset tracked function.
   * @example trackFn.reset();
   */
  reset(): TrackFn;

  /**
   * Clears all recorded calls and arguments but retains custom behavior configurations.
   * @returns {TrackFn} The cleared tracked function.
   * @example trackFn.clear();
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
 * Creates a tracked version of a given function.
 *
 * @param {Function} implementation - The original function implementation.
 * @returns {TrackFn & Function} A tracked version of the provided function.
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * const trackedAdd = Fn(add);
 * trackedAdd(1, 2); // 3
 */
export function Fn(implementation: Function): Function {
  return new TrackFn(implementation).track();
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
 * Replaces a method on an object with a tracked version of the method.
 *
 * @param {object} obj - The object containing the method.
 * @param {string} method - The name of the method to replace.
 * @returns {TrackFn & Function} The tracked version of the method.
 *
 * @throws {Error} If the method does not exist on the object or is not a function.
 *
 * @example
 * const obj = { multiply: (a: number, b: number) => a * b };
 * const trackedMultiply = spyOn(obj, 'multiply');
 * obj.multiply(2, 3); // 6
 * console.log(trackedMultiply.getCallCount()); // 1
 */
export function spyOn(obj: any, method: string): Function {
  if (!obj || typeof obj[method] !== "function") {
    throw new Error(`Method '${method}' not found on the object.`);
  }

  const originalMethod = obj[method];
  const trackedFn = Fn(originalMethod);

  obj[method] = trackedFn;

  return trackedFn;
}

/**
 * Creates a spied version of a specific method in a class instance.
 * 
 * @param {T} instance - The class instance containing the method
 * @param {K} methodName - The name of the method to spy on
 * @returns {TrackFn & Function} The tracked version of the method
 * 
 * @example
 * class Calculator {
 *   add(a: number, b: number) { return a + b; }
 * }
 * 
 * const calc = new Calculator();
 * const spiedAdd = spyOnMethod(calc, 'add');
 * calc.add(1, 2);
 * console.log(spiedAdd.getCallCount()); // 1
 */
export function spyOnMethod<T extends object, K extends MethodNames<T>>(
  instance: T,
  methodName: K
): TrackFn & Function {
  const method = instance[methodName];

  if (typeof method !== 'function') {
    throw new Error(`Method '${String(methodName)}' not found on the instance.`);
  }

  const trackedMethod = Fn(method.bind(instance)) as TrackFn & Function;

  // Replace the method with the tracked version
  Object.defineProperty(instance, methodName, {
    value: trackedMethod,
    configurable: true,
    writable: true,
  });

  return trackedMethod;
}