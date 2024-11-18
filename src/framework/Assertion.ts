import { getType } from "../utils/index.js";
import { deepEqual } from "../utils/index.js";
import { AssertionError } from "./AssertionError.js";
import { AssertionMessages } from "./AssertionMessages.js";

class Assertion {
  private received: any;
  private isNot: boolean;
  private messages: AssertionMessages;

  constructor(received: any) {
    this.received = received;
    this.isNot = false;
    this.messages = new AssertionMessages(this.isNot);
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

  // --- Type Matchers ---
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
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    const callCount = this.received.getCallCount();
    const action = "to have been called";
    const expected = "at least once";

    const message = isMockedOrSpied
      ? this.messages.mockCall({
          received: "function",
          action,
          expected,

          callCount,
        })
      : "Function must be mocked or spied on to verify calls.";

    this.assert(isMockedOrSpied && callCount > 0, message, "toHaveBeenCalled");
    return this;
  }

  toHaveBeenCalledTimes(times: number) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    const callCount = this.received.getCallCount();
    const action = "to have been called";
    const expected = `${times} ${times === 1 ? "time" : "times"}`;

    const message = isMockedOrSpied
      ? this.messages.mockCall({
          received: "function",
          action,
          expected,

          callCount,
        })
      : "Function must be mocked or spied on to verify calls.";

    this.assert(
      isMockedOrSpied && callCount === times,
      message,
      "toHaveBeenCalledTimes",
    );
    return this;
  }

  toHaveBeenCalledWith(...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Check if any call matches the given arguments
    const hasTheseArgs = this.received.calls.some((call: SpyCall) => {
      return (
        call.args.length === args.length &&
        call.args.every((arg, index) => deepEqual(arg, args[index]))
      );
    });

    const callCount = this.received.getCallCount();
    const action = "to have been called with";

    const message = isMockedOrSpied
      ? this.messages.mockCall({
          received: "function",
          action,
          expected: "",

          callCount,
          args,
        })
      : "Function must be mocked or spied on to verify calls.";

    this.assert(
      isMockedOrSpied && hasTheseArgs,
      message,
      "toHaveBeenCalledWith",
    );
    return this;
  }

  toHaveBeenNthCalledWith(n: number, ...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Check if the nth call matches the expected arguments
    const nthCall = this.received.calls[n - 1]; // n is 1-based index
    const nthCallArgs =
      nthCall &&
      nthCall.args.length === args.length &&
      nthCall.args.every((arg: any, index: number) =>
        deepEqual(arg, args[index]),
      );

    const callCount = this.received.getCallCount();
    const action = `to have been called ${n} ${n === 1 ? "time" : "times"} with`;

    const message = isMockedOrSpied
      ? this.messages.mockCall({
          received: this.received,
          action,
          expected: "",

          callCount,
          args,
        })
      : "Function must be mocked or spied on to verify calls.";

    this.assert(
      isMockedOrSpied && nthCallArgs,
      message,
      "toHaveBeenNthCalledWith",
    );
    return this;
  }

  toHaveBeenLastCalledWith(...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Get the last call and check if its arguments match the expected ones
    const lastCall = this.received.calls[this.received.calls.length - 1];
    const lastCallArgs =
      lastCall &&
      lastCall.args.length === args.length &&
      lastCall.args.every((arg: any, index: number) =>
        deepEqual(arg, args[index]),
      );

    const callCount = this.received.getCallCount();
    const action = "to have been called last with";

    const message = isMockedOrSpied
      ? this.messages.mockCall({
          received: this.received,
          action,
          expected: "",

          callCount,
          args,
        })
      : "Function must be mocked or spied on to verify calls.";

    this.assert(
      isMockedOrSpied && lastCallArgs,
      message,
      "toHaveBeenLastCalledWith",
    );
    return this;
  }

  toHaveCalledNthWith(n: number, ...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Check if the nth call matches the expected arguments
    const nthCall = this.received.calls[n - 1]; // n is 1-based index
    const nthCallArgs =
      nthCall &&
      nthCall.args.length === args.length &&
      nthCall.args.every((arg: any, index: number) =>
        deepEqual(arg, args[index]),
      );

    const callCount = this.received.getCallCount();
    const action = `to have been called ${n} ${n === 1 ? "time" : "times"} with`;

    const message = isMockedOrSpied
      ? this.messages.mockCall({
          received: this.received,
          action,
          expected: "",

          callCount,
          args,
        })
      : "Function must be mocked or spied on to verify calls.";

    this.assert(isMockedOrSpied && nthCallArgs, message, "toHaveCalledNthWith");
    return this;
  }

  toHaveBeenCalledLastCalledWith(...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Get the last call and check if its arguments match the expected ones
    const lastCall = this.received.calls[this.received.calls.length - 1];
    const lastCallArgs =
      lastCall &&
      lastCall.args.length === args.length &&
      lastCall.args.every((arg: any, index: number) =>
        deepEqual(arg, args[index]),
      );

    const callCount = this.received.getCallCount();
    const action = "to have been called last with";

    const message = isMockedOrSpied
      ? this.messages.mockCall({
          received: this.received,
          action,
          expected: "",

          callCount,
          args,
        })
      : "Function must be mocked or spied on to verify calls.";

    this.assert(
      isMockedOrSpied && lastCallArgs,
      message,
      "toHaveBeenCalledLastCalledWith",
    );
    return this;
  }

  toHaveReturned() {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    const returnCount = this.received.getReturnValues().length;
    const action = "to have returned";
    const expected = "at least once";

    const message = isMockedOrSpied
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected,

          returnCount,
        })
      : "Function must be mocked or spied on to verify returns.";

    this.assert(
      isMockedOrSpied && returnCount > 0,
      message,
      "toHaveReturned",
    );
    return this;
  }

  toHaveReturnedTimes(times: number) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    const returnCount = this.received.getReturnValues().length;
    const action = "to have returned";
    const expected = `${times} ${times === 1 ? "time" : "times"}`;

    const message = isMockedOrSpied
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected,

          returnCount,
        })
      : "Function must be mocked or spied on to verify returns.";

    this.assert(
      isMockedOrSpied && returnCount === times,
      message,
      "toHaveReturnedTimes",
    );
    return this;
  }

  toHaveReturnedWith(...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Check if any return matches the given arguments
    const hasTheseReturns = this.received
      .getReturnValues()
      .some((returnValue: any) => {
        return (
          args.length === returnValue.length &&
          args.every((arg: any, index: number) =>
            deepEqual(arg, returnValue[index]),
          )
        );
      });

    const returnCount = this.received.getReturnValues().length;
    const action = "to have returned with";

    const message = isMockedOrSpied
      ? this.messages.mockReturn({
          received: "function",
          action,
          expected: "",

          returnCount,
          args,
        })
      : "Function must be mocked or spied on to verify returns.";

    this.assert(
      isMockedOrSpied && hasTheseReturns,
      message,
      "toHaveReturnedWith",
    );
    return this;
  }

  toHaveReturnedLastWith(...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Get the last return value and check if it matches the expected arguments
    const lastReturn = this.received.getReturnValues().slice(-1)[0];
    const lastReturnArgs =
      lastReturn &&
      lastReturn.length === args.length &&
      lastReturn.every((arg: any, index: number) =>
        deepEqual(arg, args[index]),
      );

    const returnCount = this.received.getReturnValues().length;
    const action = "to have returned last with";

    const message = isMockedOrSpied
      ? this.messages.mockReturn({
          received: this.received,
          action,
          expected: "",

          returnCount,
          args,
        })
      : "Function must be mocked or spied on to verify returns.";

    this.assert(
      isMockedOrSpied && lastReturnArgs,
      message,
      "toHaveReturnedLastWith",
    );
    return this;
  }

  toHaveReturnedNthWith(n: number, ...args: any) {
    const isMockedOrSpied =
      Mock.isMocked(this.received) || Spy.isSpiedOn(this.received);

    // Check if the nth return matches the expected arguments
    const nthReturn = this.received.getReturnValues()[n - 1]; // n is 1-based index
    const nthReturnArgs =
      nthReturn &&
      nthReturn.length === args.length &&
      nthReturn.every((arg: any, index: number) => deepEqual(arg, args[index]));

    const returnCount = this.received.getReturnValues().length;
    const action = `to have returned ${n} ${n === 1 ? "time" : "times"} with`;

    const message = isMockedOrSpied
      ? this.messages.mockReturn({
          received: this.received,
          action,
          expected: "",

          returnCount,
          args,
        })
      : "Function must be mocked or spied on to verify returns.";

    this.assert(
      isMockedOrSpied && nthReturnArgs,
      message,
      "toHaveReturnedLastWith",
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
