/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { equal } from "../utils/index.js";
import { getType } from "../utils/index.js";
import { deepEqual } from "../utils/index.js";
import { AssertionError } from "./AssertionError.js";
import { AssertionMessages } from "./AssertionMessages.js";
import { Diff } from "./Diff.js";
import { Is } from "./Is.js";

class Assertion {
  private received: any;
  private isNot: boolean;
  private messages: AssertionMessages;
  private isTracked: boolean = false;

  constructor(received: any) {
    this.received = received;
    this.isNot = false;
    this.messages = new AssertionMessages(this.isNot);
    this.isTracked = Is.isTrackedFunction(received);
  }

  /**
   * Negate the matcher.
   */
  get not() {
    this.isNot = !this.isNot;
    return this;
  }

  /**
   * Core assert method for all matchers.
   */
  private assert(condition: boolean, message: string, matcher: string) {
    const passes = this.isNot ? !condition : condition;

    if (!passes) {
      throw new AssertionError(message, matcher);
    }
  }

  private typeOf(expected: string, matcher: string) {
    const message = this.messages.type({
      received: this.received,
      expected,
    });
    this.assert(getType(this.received) === expected, message, matcher);
    return this;
  }

  // ---  Matchers ---
  toStrictEqual(expected: any) {
    const diff = new Diff(this.received, expected)
    const message = this.messages.diff({ diffFormatted: diff.format()})
    this.assert(!diff.has(), message, "toBe");
    return this;
  }

  toEqual(expected: any) {
    const diff = new Diff(this.received, expected)
    const message = this.messages.diff({ diffFormatted: diff.format()})
    this.assert(equal(this.received, expected), message, "toEqual");
    return this;
  }

  toBeType(expected: string) {
    return this.typeOf(expected, "toBeType");
  }

  toBeString() {
    return this.typeOf("string", "toBeString");
  }

  toBeNumber() {
    return this.typeOf("number", "toBeNumber");
  }

  toBeBoolean() {
    return this.typeOf("boolean", "toBeBoolean");
  }

  toBeArray() {
    return this.typeOf("array", "toBeArray");
  }

  toBeObject() {
    return this.typeOf("object", "toBeObject");
  }

  toBeFunction() {
    return this.typeOf("function", "toBeFunction");
  }

  toBeNull() {
    return this.typeOf("null", "toBeNull");
  }

  toBeUndefined() {
    return this.typeOf("undefined", "toBeUndefined");
  }

  // --- Instance Matcher ---
  toBeInstanceOf(expected: Function) {
    const message = this.messages.instance({
      received: this.received,
      expected,
    });
    this.assert(this.received instanceof expected, message, "toBeInstanceOf");
    return this;
  }

  // --- Comparison Matchers ---
  toBeGreaterThan(expected: number) {
    const message = this.messages.comparison({
      received: this.received,
      expected,
      comparison: "to be greater than",
    });
    const condition =
      getType(this.received) === "number" && this.received > expected;
    this.assert(condition, message, "toBeGreaterThan");
    return this;
  }

  toBeLessThan(expected: number) {
    const message = this.messages.comparison({
      received: this.received,
      expected,
      comparison: "to be less than",
    });
    const condition =
      getType(this.received) === "number" && this.received < expected;
    this.assert(condition, message, "toBeLessThan");
    return this;
  }

  // --- Truthy/Falsy Matchers ---
  toBeTruthy() {
    const message = this.messages.comparison({
      received: this.received,
      expected: true,
      comparison: "to be truthy",
    });
    this.assert(Boolean(this.received), message, "toBeTruthy");
    return this;
  }

  toBeFalsy() {
    const message = this.messages.comparison({
      received: this.received,
      expected: false,
      comparison: "to be falsy",
    });
    this.assert(!this.received, message, "toBeFalsy");
    return this;
  }

  // --- Collection/String Matchers ---
  toContain(expected: any) {
    const isValidType =
      Array.isArray(this.received) || getType(this.received) === "string";
    const contains = isValidType && this.received.includes(expected);

    const message = this.messages.comparison({
      received: this.received,
      expected,
      comparison: "to contain",
    });
    this.assert(contains, message, "toContain");
    return this;
  }

  toHaveProperty(prop: string, value?: any) {
    const hasProperty = Object.prototype.hasOwnProperty.call(
      this.received,
      prop,
    );
    const matchesValue = value === undefined || this.received[prop] === value;

    const message = this.messages.property({
      received: this.received,
      prop,
      value,
    });
    this.assert(hasProperty && matchesValue, message, "toHaveProperty");
    return this;
  }

  // --- Mocking and Spying Matchers ---
  toHaveBeenCalled() {
    const callCount = this.isTracked ? this.received.getCallCount() : 0;
    const action = "to have been called";
    const expected = "at least once";

    const message = this.isTracked
      ? this.messages.mockCall({
          received: "function",
          action,
          expected,
          callCount,
        })
      : "Function must be tracked to verify calls.";

    this.assert(this.isTracked && callCount > 0, message, "toHaveBeenCalled");
    return this;
  }

  toHaveBeenCalledTimes(times: number) {
    const callCount = this.isTracked ? this.received.getCallCount() : 0;
    const action = "to have been called";
    const expected = `${times} ${times === 1 ? "time" : "times"}`;

    const message = this.isTracked
      ? this.messages.mockCall({
          received: "function",
          action,
          expected,
          callCount,
        })
      : "Function must be tracked to verify calls.";

    this.assert(
      this.isTracked && callCount === times,
      message,
      "toHaveBeenCalledTimes",
    );
    return this;
  }

  toHaveBeenCalledWith(...args: any[]) {
    const hasTheseArgs = this.isTracked
      ? this.received
          .getCalls()
          .some(
            (call: any) =>
              call.args.length === args.length &&
              call.args.every((arg: any, index: number) =>
                deepEqual(arg, args[index]),
              ),
          )
      : false;

    const callCount = this.isTracked ? this.received.getCallCount() : 0;
    const action = "to have been called with";

    const message = this.isTracked
      ? this.messages.mockCall({
          received: "function",
          action,
          expected: "",
          callCount,
          args,
        })
      : "Function must be tracked to verify calls.";

    this.assert(
      this.isTracked && hasTheseArgs,
      message,
      "toHaveBeenCalledWith",
    );
    return this;
  }

  toHaveBeenNthCalledWith(n: number, ...args: any[]) {
    const nthCall = this.isTracked ? this.received.getCall(n - 1) : undefined;
    const nthCallArgs = nthCall
      ? nthCall.args.length === args.length &&
        nthCall.args.every((arg: any, index: number) =>
          deepEqual(arg, args[index]),
        )
      : false;

    const callCount = this.isTracked ? this.received.getCallCount() : 0;
    const action = `to have been called ${n} ${n === 1 ? "time" : "times"} with`;

    const message = this.isTracked
      ? this.messages.mockCall({
          received: "function",
          action,
          expected: "",
          callCount,
          args,
        })
      : "Function must be tracked to verify calls.";

    this.assert(
      this.isTracked && nthCallArgs,
      message,
      "toHaveBeenNthCalledWith",
    );
    return this;
  }

  toHaveBeenLastCalledWith(...args: any[]) {
    const lastCall = this.isTracked ? this.received.getLatestCall() : undefined;
    const lastCallArgs = lastCall
      ? lastCall.args.length === args.length &&
        lastCall.args.every((arg: any, index: number) =>
          deepEqual(arg, args[index]),
        )
      : false;

    const callCount = this.isTracked ? this.received.getCallCount() : 0;
    const action = "to have been called last with";

    const message = this.isTracked
      ? this.messages.mockCall({
          received: "function",
          action,
          expected: "",
          callCount,
          args,
        })
      : "Function must be tracked to verify calls.";

    this.assert(
      this.isTracked && lastCallArgs,
      message,
      "toHaveBeenLastCalledWith",
    );
    return this;
  }

  toHaveReturned() {
    const returnCount = this.isTracked
      ? this.received.getReturnValues().length
      : 0;
    const action = "to have returned";
    const expected = "at least once";

    const message = this.isTracked
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected,
          returnCount,
        })
      : "Function must be tracked to verify returns.";

    this.assert(this.isTracked && returnCount > 0, message, "toHaveReturned");
    return this;
  }

  toHaveReturnedTimes(times: number) {
    const returnCount = this.isTracked
      ? this.received.getReturnValues().length
      : 0;
    const action = "to have returned";
    const expected = `${times} ${times === 1 ? "time" : "times"}`;

    const message = this.isTracked
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected,
          returnCount,
        })
      : "Function must be tracked to verify returns.";

    this.assert(
      this.isTracked && returnCount === times,
      message,
      "toHaveReturnedTimes",
    );
    return this;
  }

  toHaveReturnedWith(value: any) {
    // Check if any return value matches the expected value
    const hasReturnedValue = this.isTracked
      ? this.received
          .getReturnValues()
          .some((returnValue: any) => deepEqual(returnValue, value))
      : false;

    const returnCount = this.isTracked
      ? this.received.getReturnValues().length
      : 0;
    const action = "to have returned with";

    const message = this.isTracked
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected: value,
          returnCount,
        })
      : "Function must be tracked to verify returns.";

    this.assert(
      this.isTracked && hasReturnedValue,
      message,
      "toHaveReturnedWith",
    );
    return this;
  }

  toHaveNthReturnedWith(n: number, value: any) {
    // Retrieve the nth return value (1-based index)
    const nthReturnValue = this.isTracked
      ? this.received.getReturnValues()[n - 1]
      : undefined;
    const matchesValue = nthReturnValue && deepEqual(nthReturnValue, value);

    const returnCount = this.isTracked
      ? this.received.getReturnValues().length
      : 0;
    const action = `to have returned ${n} ${n === 1 ? "time" : "times"} with`;

    const message = this.isTracked
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected: value,
          returnCount,
        })
      : "Function must be tracked to verify returns.";

    this.assert(
      this.isTracked && matchesValue,
      message,
      "toHaveNthReturnedWith",
    );
    return this;
  }

  toHaveLastReturnedWith(value: any) {
    // Retrieve the last return value
    const lastReturnValue = this.isTracked
      ? this.received.getReturnValues().slice(-1)[0]
      : undefined;
    const matchesValue = lastReturnValue && deepEqual(lastReturnValue, value);

    const returnCount = this.isTracked
      ? this.received.getReturnValues().length
      : 0;
    const action = "to have returned last with";

    const message = this.isTracked
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected: value,
          returnCount,
        })
      : "Function must be tracked to verify returns.";

    this.assert(
      this.isTracked && matchesValue,
      message,
      "toHaveLastReturnedWith",
    );
    return this;
  }
}

/**
 * Main expect function that creates new Assertion instance
 */
export function assert(received: any) {
  return new Assertion(received);
}