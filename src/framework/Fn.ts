/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { isDeepStrictEqual } from "util";
import { getType } from "../utils";

// Define the types for the tracking function calls
export interface FunctionCall<T extends any[], R> {
  args: T;
  timestamp: Date;
  result: R;
}

export interface FunctionException {
  error: Error;
  timestamp: Date;
}

export interface TrackFn<T extends any[] = any[], R = any> {
  // Methods for tracking function calls
  getCalls(): ReadonlyArray<FunctionCall<T, R>>;
  getCall(index: number): FunctionCall<T, R> | undefined;
  getLatestCall(): FunctionCall<T, R> | undefined;
  getCallCount(): number;
  getAllArgs(): ReadonlyArray<T>;
  getArgsForCall(index: number): T | undefined;
  getReturnValues(): ReadonlyArray<R>;
  getExceptions(): ReadonlyArray<FunctionException>;

  // Methods to check function call status
  wasCalled(): boolean;
  wasCalledWith(...args: T): boolean;
  wasCalledTimes(n: number): boolean;

  // Methods for controlling the behavior of the tracked function (chainable)
  return(value: R): TrackFn<T, R>;
  throw(error: Error): TrackFn<T, R>;
  use<F extends (...args: any[]) => any>(fn: F): TrackFn<T, R>;
  reset(): TrackFn<T, R>;
  clear(): TrackFn<T, R>;
}

// TrackFn class definition
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

// Fn function to create a new instance of TrackFn
export function Fn<T extends any[], R>(
  implementation: (...args: T) => R,
): (...args: T) => R {
  return new TrackFn(implementation).track();
}

export function isFn(value: any): boolean {
  if(typeof value !== "function") return false
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
