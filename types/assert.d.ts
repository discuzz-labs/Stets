/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export interface Assertion {
  /**
   * Negates the assertion.
   * @returns {Assertion} The current `Assertion` instance with negation applied.
   */
  get not(): Assertion;

  /**
   * Compares the received value with the expected value using a strict equality check.
   * This method uses `diff` to display the difference between the two values.
   *
   * @param expected - The value to compare the received value against.
   * @returns This instance for chaining.
   * @since v1.0.0
   */
  toStrictEqual(expected: any): this;

  /**
   * Compares the received value with the expected value using a deep equality check.
   * This method uses `equal` to deeply compare the two values, ignoring `undefined`.
   *
   * @param expected - The value to compare the received value against.
   * @returns This instance for chaining.
   * @since v1.0.0
   */
  toEqual(expected: any): this;

  /**
   * Asserts that the actual value is of a specific type.
   * @param {string} expected - The type to compare against (e.g., "string", "number").
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeTypeOf(expected: string): this;

  /**
   * Asserts that the actual value is a string.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeString(): this;

  /**
   * Asserts that the actual value is a number.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeNumber(): this;

  /**
   * Asserts that the actual value is a boolean.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeBoolean(): this;

  /**
   * Asserts that the actual value is an array.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeArray(): this;

  /**
   * Asserts that the actual value is an object.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeObject(): this;

  /**
   * Asserts that the actual value is a function.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeFunction(): this;

  /**
   * Asserts that the actual value is null.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeNull(): this;

  /**
   * Asserts that the actual value is undefined.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeUndefined(): this;

  /**
   * Asserts that the actual value is an instance of the expected constructor.
   * @param {Function} expected - The constructor to compare against.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeInstanceOf(expected: Function): this;

  /**
   * Asserts that the actual value is greater than the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeGreaterThan(expected: number): this;

  /**
   * Asserts that the actual value is less than the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeLessThan(expected: number): this;

  /**
   * Asserts that the actual value is truthy.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeTruthy(): this;

  /**
   * Asserts that the actual value is falsy.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toBeFalsy(): this;

  /**
   * Asserts that the actual value contains the expected value.
   * @param {any} expected - The value to check for in the actual value.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toContain(expected: any): this;

  /**
   * Asserts that the actual object has a specific property.
   * @param {string} prop - The property name.
   * @param {any} [value] - The value to compare against (optional).
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveProperty(prop: string, value?: any): this;

  /**
   * Asserts that the actual function has been called.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveBeenCalled(): this;

  /**
   * Asserts that the actual function has been called a specific number of times.
   * @param {number} count - The expected number of calls.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveBeenCalledTimes(count: number): this;

  /**
   * Asserts that the actual function has been called with specific arguments.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveBeenCalledWith(...args: any[]): this;

  /**
   * Asserts that the actual function has been called with specific arguments at a specific call index.
   * @param {number} n - The call index.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveBeenNthCalledWith(n: number, ...args: any[]): this;

  /**
   * Asserts that the actual function has been called with specific arguments at the last call.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveBeenLastCalledWith(...args: any[]): this;

  /**
   * Asserts that the actual function has been called with specific arguments at a specific call index.
   * @param {number} n - The call index.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveCalledNthWith(n: number, ...args: any[]): this;

  /**
   * Asserts that the actual function has been called with specific arguments at the last call.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveBeenCalledLastCalledWith(...args: any[]): this;

  /**
   * Asserts that the actual function has returned in his call lifecycle.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveReturned(): this;

  /**
   * Asserts that the actual function has returned a value a specific number of times.
   * @param {number} count - The expected number of return values.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveReturnedTimes(count: number): this;

  /**
   * Asserts that the actual function has returned a specific value.
   * @param {any} expected - The value that should have been returned.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveReturnedWith(expected: any): this;

  /**
   * Asserts that the actual function has returned the value at the last return.
   * @param {any} expected - The value that should have been returned.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveReturnedLastWith(expected: any): this;

  /**
   * Asserts that the actual function has returned the value at a specific return index.
   * @param {number} n - The return index.
   * @param {any} expected - The value that should have been returned.
   * @returns {Assertion} The current `Assertion` instance.
   */
  toHaveReturnedNthWith(n: number, expected: any): this;
}
