/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { AssertionError } from "./AssertionError.js";
import { diff } from "./Diff.js";
import { isFn } from "./Fn.js";
import { format } from "pretty-format";
import { getOrdinal, getType } from "../utils/index.js";

/**
 * A class providing assertion methods for testing.
 */
export interface Assertion {
  /**
   * Asserts that the received value is defined (not `undefined`).
   * @returns {Assertion | boolean} Assertion result.
   * @example
   * assert(5).toBeDefined(); // Passes
   * assert(undefined).toBeDefined(); // Fails
   */
  toBeDefined(): Assertion | boolean;
  /**
   * Checks if the received value is `undefined`
   * @returns {Assertion | boolean} - The result of the assertion
   * @example
   * assert(undefined).toBeUndefined(); // Passes
   * assert(42).toBeUndefined(); // Fails
   */
  toBeUndefined(): Assertion | boolean;
  /**
   * Checks if the received value is `null`
   * @returns {Assertion | boolean} - The result of the assertion
   * @example
   * assert(null).toBeNull(); // Passes
   * assert(42).toBeNull(); // Fails
   */
  toBeNull(): Assertion | boolean;
  /**
   * Checks if the received value evaluates to `true` in a boolean context
   * @returns {Assertion | boolean} - The result of the assertion
   * @example
   * assert(1).toBeTruthy(); // Passes
   * assert(false).toBeTruthy(); // Fails
   */
  toBeTruthy(): Assertion | boolean;
  /**
   * Asserts that the received value is falsy (evaluates to `false` in a boolean context).
   * @returns {Assertion | boolean} Assertion result.
   * @example
   * assert(false).toBeFalsy(); // Passes
   * assert(1).toBeFalsy(); // Fails
   */
  toBeFalsy(): Assertion | boolean;
  /**
   * Asserts that the received value is greater than the expected value.
   * @param {number | bigint} expected - The expected value.
   * @returns {Assertion | boolean} Assertion result.
   * @example
   * assert(5).toBeGreaterThan(3); // Passes
   * assert(1).toBeGreaterThan(5); // Fails
   */
  toBeGreaterThan(expected: number | bigint): Assertion | boolean;
  /**
   * Checks if the received value is greater than or equal to the expected value
   * @param {number | bigint} expected - The value to compare against
   * @returns {Assertion | boolean} - The result of the assertion
   * @example
   * assert(10).toBeGreaterThanOrEqual(10); // Passes
   * assert(5).toBeGreaterThanOrEqual(10); // Fails
   */
  toBeGreaterThanOrEqual(expected: number | bigint): Assertion | boolean;
  /**
   * Checks if the received value is less than the expected value
   * @param {number | bigint} expected - The value to compare against
   * @returns {Assertion | boolean} - The result of the assertion
   * @example
   * assert(5).toBeLessThan(10); // Passes
   * assert(10).toBeLessThan(5); // Fails
   */
  toBeLessThan(expected: number | bigint): Assertion | boolean;
  /**
   * Checks if the received value is an instance of the given class or constructor
   * @param {Function} expectedClass - The class or constructor to check against
   * @returns {Assertion | boolean} - The result of the assertion
   * @example
   * assert(new Date()).toBeInstanceOf(Date); // Passes
   * assert({}).toBeInstanceOf(Date); // Fails
   */
  toBeInstanceOf(expectedClass: (...args: any) => any): Assertion | boolean;
  /**
   * Checks if the received value is less than or equal to the expected value
   * @param {number | bigint} expected - The value to compare against
   * @returns {Assertion | boolean} - The result of the assertion
   * @example
   * assert(10).toBeLessThanOrEqual(10); // Passes
   * assert(15).toBeLessThanOrEqual(10); // Fails
   */
  toBeLessThanOrEqual(expected: number | bigint): Assertion | boolean;
  /**
   * Checks if a value is `NaN`.
   * @returns {Assertion | boolean} Assertion result.
   * @example
   * assert(NaN).toBeNaN(); // Passes
   * assert(5).toBeNaN(); // Fails
   */
  toBeNaN(): Assertion | boolean;
  /**
   * Asserts that the received value matches the provided regular expression or string.
   * @param {RegExp | string} expected - The expected pattern.
   * @returns {Assertion | boolean} Assertion result.
   * @example
   * assert("hello").toMatch(/he/); // Passes
   * assert("world").toMatch("wor"); // Passes
   */
  toMatch(expected: RegExp | string): Assertion | boolean;
  /**
   * Checks if the received value is strictly equal to the expected value
   * @param {any} expected - The value to compare against
   * @returns {Assertion | boolean} Assertion result
   * @example
   * // Passes
   * assert(5).toBe(5)
   *
   * // Fails
   * assert(5).toBe(6)
   */
  toBe(expected: any): Assertion | boolean;
  /**
   * Asserts that the received value is deeply equal to the expected value.
   * - Performs a deep comparison between the received and expected values,
   *   checking all nested properties for equality.
   * - Suitable for comparing objects, arrays, and primitives.
   *
   * @param {any} expected - The value to compare against the received value.
   * @returns {Assertion | boolean} - Returns an Assertion instance or a boolean depending on configuration.
   *
   * @example
   * // Objects with the same structure pass
   * assert({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } }); // Passes
   *
   * // Arrays with the same elements pass
   * assert([1, 2, 3]).toEqual([1, 2, 3]); // Passes
   *
   * // Primitives with the same value pass
   * assert(42).toEqual(42); // Passes
   */
  toEqual(expected: any): Assertion | boolean;
  /**
   * Checks if the received value contains the expected value.
   * - For arrays, it checks if the array includes the expected value.
   * - For strings, it checks if the string includes the expected substring.
   *
   * @param {any} expected - The value to check for in the received value.
   * @returns {Assertion | boolean} - The result of the assertion.
   * @example
   * assert([1, 2, 3]).toContain(2); // Passes
   * assert("hello world").toContain("world"); // Passes
   * assert([1, 2, 3]).toContain(5); // Fails
   */
  toContain(expected: any): Assertion | boolean;

  /**
Asserts that a tracked function throws an exception that matches the expected value.
 * This method checks the last exception thrown by a tracked function and compares it with the expected exception.
 * If the exception does not match, it will display the differences between the thrown exception and the expected one.
 * 
 * If no exceptions are thrown, it will fail the assertion with a message: "No exceptions were thrown!".
 * If an exception is thrown, it compares the exception with the expected value and reports any differences.
 * 
 * @param {any} expected - The expected exception or value to compare against the thrown exception.
 * This could be an exact match or a complex object that will be compared with the thrown exception.
 * 
 * @throws {Error} Throws an error if the function is not being tracked or if the exception does not match the expected value.
 * 
 * @returns {boolean} Returns `true` if the exception matches the expected value (no differences), otherwise returns `false` and logs the exception differences.
 * 
 * @example
 * assert(() => { throw new Error("Expected error") }).toThrow("Expected error") // Passes
 */
  toThrow(expected: any): Assertion | boolean;
  /**
   * Checks if the number is close to another number within a specified precision
   * @param {number} expected - Expected number
   * @param {number} [numDigits=2] - Number of decimal places to compare
   * @returns {Assertion | boolean} Assertion result
   * @example
   * assert(3.14159).toBeCloseTo(Math.PI, 2)
   */
  toBeCloseTo(expected: number, numDigits?: number): Assertion | boolean;
  /**
   * Checks if the received function has been called
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => {});
   * mockFn();
   * assert(mockFn).toHaveBeenCalled()
   */
  toBeTracked(): Assertion | boolean;
  /**
   * Checks if the received function has been called
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => {});
   * mockFn();
   * assert(mockFn).toHaveBeenCalled()
   */
  toHaveBeenCalled(): Assertion | boolean;
  /**
   * Checks if the received function has been called exactly n times
   * @param {number} times - Number of expected calls
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => {});
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveBeenCalledTimes(2)
   */
  toHaveBeenCalledTimes(times: number): Assertion | boolean;
  /**
   * Checks if the received function was called with specific arguments
   * @param {...any} args - Arguments to check
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn((a: number, b: string) => {});
   * mockFn(42, "hello");
   * assert(mockFn).toHaveBeenCalledWith(42, "hello")
   */
  toHaveBeenCalledWith(...args: any[]): Assertion | boolean;
  /**
   * Checks if the function was last called with specific arguments
   * @param {...any} args - Arguments to check for the last call
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn((a: number) => {});
   * mockFn(1);
   * mockFn(2);
   * assert(mockFn).toHaveBeenLastCalledWith(2)
   */
  toHaveBeenLastCalledWith(...args: any[]): Assertion | boolean;
  /**
   * Checks if the nth call of the function was with specific arguments
   * @param {number} n - The call number to check (1-indexed)
   * @param {...any} args - Arguments to check for the nth call
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn((a: number) => {});
   * mockFn(1);
   * mockFn(2);
   * mockFn(3);
   * assert(mockFn).toHaveBeenNthCalledWith(2, 2)
   */
  toHaveBeenNthCalledWith(n: number, ...args: any[]): Assertion | boolean;
  /**
   * Checks if the function has returned at least once
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * assert(mockFn).toHaveReturned()
   */
  toHaveReturned(): Assertion | boolean;
  /**
   * Checks if the function has returned exactly n times
   * @param {number} times - Number of expected returns
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveReturnedTimes(2)
   */
  toHaveReturnedTimes(times: number): Assertion | boolean;
  /**
   * Checks if the function has returned with a specific value
   * @param {any} value - The value to check for in return values
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * assert(mockFn).toHaveReturnedWith(42)
   */
  toHaveReturnedWith(value: any): Assertion | boolean;
  /**
   * Checks if the function's last return was a specific value
   * @param {any} value - The value to check for in the last return
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveLastReturnedWith(42)
   */
  toHaveLastReturnedWith(value: any): Assertion | boolean;
  /**
   * Checks if the nth return of the function was a specific value
   * @param {number} n - The return number to check (1-indexed)
   * @param {any} value - The value to check for in the nth return
   * @returns {Assertion | boolean} Assertion result
   * @throws {Error} If received is not a tracked function
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveNthReturnedWith(2, 42)
   */
  toHaveNthReturnedWith(n: number, value: any): Assertion | boolean;
  /**
   * Checks if the received value has a specific length
   * @param {number} length - Expected length
   * @returns {Assertion | boolean} Assertion result
   * @example
   * assert([1, 2, 3]).toHaveLength(3)
   * assert("hello").toHaveLength(5)
   */
  toHaveLength(length: number): Assertion | boolean;
  /**
   * Checks if the received object has a specific property with an optional value
   * @param {string} keyPath - Dot-notation path to the property
   * @param {any} [value] - Optional expected value of the property
   * @returns {Assertion | boolean} Assertion result
   * @example
   * assert({ a: { b: 42 } }).toHaveProperty('a.b', 42)
   * assert({ x: 1 }).toHaveProperty('x')
   */
  toHaveProperty(keyPath: string, value?: any): Assertion | boolean;
}

export class Assertion {
  received: any;
  isNot: boolean;
  isTracked: boolean = false;
  throws: boolean = false;

  constructor(received: any, throws: boolean) {
    this.throws = throws;
    this.received = received;
    this.isNot = false;
    this.isTracked = isFn(this.received);
  }

  get not() {
    this.isNot = !this.isNot;
    return this;
  }

  get resolves() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === "not") return target.not;
        return async (...args: any[]) => {
          try {
            const resolvedValue = await this.received;
            target.received = resolvedValue;
            return (target as any)[prop](...args);
          } catch (err: any) {
            throw new Error(
              `Expected Promise to resolve but it rejected with: ${err}`,
            );
          }
        };
      },
    });
  }

  get rejects() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === "not") return target.not;
        return async (...args: any[]) => {
          try {
            await this.received;
            throw new Error("Expected Promise to reject but it resolved.");
          } catch (err) {
            target.received = err;
            return (target as any)[prop](...args);
          }
        };
      },
    });
  }

  private assert(
    condition: boolean,
    message: string,
    matcher: string,
  ): Assertion | boolean {
    const passes = this.isNot ? !condition : condition;
    if (!passes) {
      if (this.throws) {
        throw new AssertionError(message, matcher);
      } else {
        return false;
      }
    }
    return this.throws ? this : true;
  }

  toBeDefined(): Assertion | boolean {
    return this.assert(
      this.received !== undefined,
      "Expected value to be defined",
      "toBeDefined",
    );
  }

  toBeUndefined(): Assertion | boolean {
    return this.assert(
      this.received === undefined,
      "Expected value to be undefined, but received a defined value",
      "toBeUndefined",
    );
  }

  toBeNull(): Assertion | boolean {
    return this.assert(
      this.received === null,
      "Expected value to be null, but received a non-null value",
      "toBeNull",
    );
  }

  toBeTruthy(): Assertion | boolean {
    return this.assert(
      Boolean(this.received),
      "Expected value to be truthy, but received a falsy value",
      "toBeTruthy",
    );
  }

  toBeFalsy(): Assertion | boolean {
    return this.assert(
      !this.received,
      "Expected value to be falsy",
      "toBeFalsy",
    );
  }

  toBeGreaterThan(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received > expected,
      `Expected ${this.received} to be greater than ${expected}`,
      "toBeGreaterThan",
    );
  }

  toBeGreaterThanOrEqual(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received >= expected,
      `Expected ${this.received} to be greater than or equal to ${expected}`,
      "toBeGreaterThanOrEqual",
    );
  }

  toBeLessThan(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received < expected,
      `Expected ${this.received} to be less than ${expected}`,
      "toBeLessThan",
    );
  }

  toBeInstanceOf(expectedClass: (...args: any) => any): Assertion | boolean {
    return this.assert(
      this.received instanceof expectedClass,
      `Expected value to be an instance of ${expectedClass.name}, but received ${this.received.constructor.name}`,
      "toBeInstanceOf",
    );
  }

  toBeLessThanOrEqual(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received <= expected,
      `Expected ${this.received} to be less than or equal to ${expected}`,
      "toBeLessThanOrEqual",
    );
  }

  toBeNaN(): Assertion | boolean {
    return this.assert(
      Number.isNaN(this.received),
      "Expected value to be NaN",
      "toBeNaN",
    );
  }

  toMatch(expected: RegExp | string): Assertion | boolean {
    const pass =
      getType(expected) === "regexp"
        // @ts-ignore
        ? expected.test(this.received)
        : this.received.includes(expected);
    return this.assert(
      pass,
      `Expected ${this.received} to match ${expected}`,
      "toMatch",
    );
  }

  toBe(expected: any): Assertion | boolean {
    return this.assert(
      Object.is(this.received, expected),
      diff(this.received, expected).diffFormatted,
      "toBe",
    );
  }

  toEqual(expected: any): Assertion | boolean {
    const diffs = diff(this.received, expected);

    return this.assert(
      diffs.hasDiffs === false,
      diffs.diffFormatted,
      "toEqual",
    );
  }

  toContain(expected: any): Assertion | boolean {
    const isString = typeof this.received === "string";
    const isArray = Array.isArray(this.received);

    if (!isString && !isArray) {
      return this.assert(
        false,
        `Expected value to be an array or string, but received: ${typeof this.received}`,
        "toContain",
      );
    }

    const contains = isString
      ? this.received.includes(expected)
      : isArray
        ? this.received.includes(expected)
        : false;

    return this.assert(
      contains,
      `Expected ${isString ? `"${this.received}"` : format(this.received)} to contain ${format(expected)}`,
      "toContain",
    );
  }

  toBeCloseTo(expected: number, numDigits: number = 2): Assertion | boolean {
    const multiplier = Math.pow(10, numDigits);
    const actualRounded = Math.round(this.received * multiplier);
    const expectedRounded = Math.round(expected * multiplier);

    return this.assert(
      actualRounded === expectedRounded,
      `Expected ${this.received} to be close to ${expected} within ${numDigits} decimal places`,
      "toBeCloseTo",
    );
  }

  toThrow(expected: any) {
    if (!this.isTracked) {
      throw new Error("toThrow can only be used with tracked functions");
    }

    const exceptions = this.received.getExceptions();
    if (exceptions.length === 0) {
      return this.assert(false, "No exceptions were thrown!", "toThrow");
    } else {
      const diffs = diff(exceptions[exceptions.length - 1], expected);
      return this.assert(
        diffs.hasDiffs === false,
        `Exception diffrences: \n\n ${diffs.diffFormatted}`,
        "toThrow",
      );
    }
  }

  toBeTracked(): Assertion | boolean {
    return this.assert(
      this.isTracked,
      "Expected function to be tracked",
      "toBeTracked",
    );
  }

  toHaveBeenCalled(): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenCalled can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.wasCalled(),
      "Expected function to have been called",
      "toHaveBeenCalled",
    );
  }

  toHaveBeenCalledTimes(times: number): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenCalledTimes can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.wasCalledTimes(times),
      `Expected function to have been called ${times} times, but was called ${this.received.getCallCount()} times`,
      "toHaveBeenCalledTimes",
    );
  }

  toHaveBeenCalledWith(...args: any[]): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenCalledWith can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.wasCalledWith(...args),
      `Expected function to have been called with ${format(args)}.`,
      "toHaveBeenCalledWith",
    );
  }

  toHaveBeenLastCalledWith(...args: any[]): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenLastCalledWith can only be used with tracked functions",
      );
    }
    const latestCall = this.received.getLatestCall();
    const diffs = diff(latestCall.args, args);
    return this.assert(
      latestCall && diffs.hasDiffs === false,
      `Function's last call differences: \n\n${diffs.diffFormatted}`,
      "toHaveBeenLastCalledWith",
    );
  }

  toHaveBeenNthCalledWith(n: number, ...args: any[]): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenNthCalledWith can only be used with tracked functions",
      );
    }
    const call = this.received.getCall(n - 1);
    const diffs = diff(call.args, args);
    return this.assert(
      call && diffs.hasDiffs === false,
      `Function's ${n}${getOrdinal(n)} call differences: \n\n${diffs.diffFormatted}`,
      "toHaveBeenNthCalledWith",
    );
  }

  toHaveReturned(): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error("toHaveReturned can only be used with tracked functions");
    }
    return this.assert(
      this.received.getReturnValues().length > 0,
      "Expected function to have returned",
      "toHaveReturned",
    );
  }

  toHaveReturnedTimes(times: number): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveReturnedTimes can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.getReturnValues().length === times,
      `Expected function to have returned ${times} times, but returned ${this.received.getReturnValues().length} times`,
      "toHaveReturnedTimes",
    );
  }

  toHaveReturnedWith(value: any): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveReturnedWith can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received
        .getReturnValues()
        .some((rv: any) => diff(rv, value).hasDiffs),
      `Expected function to have returned with ${format(value)}`,
      "toHaveReturnedWith",
    );
  }

  toHaveLastReturnedWith(value: any): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveLastReturnedWith can only be used with tracked functions",
      );
    }
    const returnValues = this.received.getReturnValues();
    const diffs = diff(returnValues[returnValues.length - 1], value);
    return this.assert(
      returnValues.length > 0 && diffs.hasDiffs === false,
      `Function's last return differences: \n\n${diffs.diffFormatted}`,
      "toHaveLastReturnedWith",
    );
  }

  toHaveNthReturnedWith(n: number, value: any): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveNthReturnedWith can only be used with tracked functions",
      );
    }
    const returnValues = this.received.getReturnValues();
    const diffs = diff(returnValues[n - 1], value);
    return this.assert(
      returnValues.length >= n && diffs.hasDiffs === false,
      `Function's ${n}${getOrdinal(n)} return differences: \n\n ${diffs.diffFormatted}`,
      "toHaveNthReturnedWith",
    );
  }

  toHaveLength(length: number): Assertion | boolean {
    return this.assert(
      this.received.length === length,
      `Expected length to be ${length}, but got ${this.received.length}`,
      "toHaveLength",
    );
  }

  toHaveProperty(keyPath: string, value?: any): Assertion | boolean {
    const keys = keyPath.split(".");
    let obj = this.received;

    for (const key of keys) {
      if (obj === null || typeof obj !== "object" || !(key in obj)) {
        return this.assert(
          false,
          `Property ${keyPath} not found`,
          "toHaveProperty",
        );
      }
      obj = obj[key];
    }

    if (arguments.length > 1) {
      const diffs = diff(obj, value);
      return this.assert(
        diffs.hasDiffs === false,
        `Property ${keyPath} does not have expected value`,
        "toHaveProperty",
      );
    }

    return this.assert(true, "", "toHaveProperty");
  }
}

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
export function assert(received: any): Assertion {
  return new Assertion(received, true);
}

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
export function is(received: any): Assertion {
  return new Assertion(received, false);
}
