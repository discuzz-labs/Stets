/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export interface IsAssertion {
  /**
   * Negates the assertion.
   * @returns {Assertion} The current `Assertion` instance with negation applied.
   */
  get not(): IsAssertion;

  /**
   * A getter that returns a proxy function for tracking assertions on promises that resolve.
   * The returned function can be used to chain assertions on a promise that is expected to resolve.
   *
   * This proxy ensures that once the promise resolves, the actual resolved value is passed
   * to the assertion methods, allowing for proper validation of the resolved value.
   *
   * @returns {Assertion} The current `Assertion` instance wrapped in a proxy that tracks and modifies
   *                       the behavior for assertions on resolved promises.
   *
   * @example
   *
   * // Usage example:
   *
   * const assertion = new Assertion(promise);
   * assertion.resolves.toEqual(expectedValue); // Assert that the promise resolves with expected value.
   *
   * @since v1.0.0
   */
  get resolves(): IsAssertion;

  /**
   * A getter that returns a proxy function for tracking assertions on promises that reject.
   * The returned function can be used to chain assertions on a promise that is expected to reject.
   *
   * This proxy ensures that once the promise rejects, the rejection reason is passed
   * to the assertion methods, allowing for proper validation of the rejection reason.
   *
   * @returns {Assertion} The current `Assertion` instance wrapped in a proxy that tracks and modifies
   *                       the behavior for assertions on rejected promises.
   *
   * @example
   *
   * // Usage example:
   *
   * const assertion = new Assertion(promise);
   * assertion.rejects.toEqual(expectedError); // Assert that the promise rejects with expected error.
   *
   * @since v1.0.0
   */
  get rejects(): IsAssertion;

  /**
   * Compares the received value with the expected value using a strict equality check.
   * This method uses `diff` to display the difference between the two values.
   *
   * @param expected - The value to compare the received value against.
   * @returns {boolean} `true` if the values are strictly equal, otherwise `false`.
   * @since v1.0.0
   */
  toStrictEqual(expected: any): boolean;

  /**
   * Compares the received value with the expected value using a deep equality check.
   * This method uses `equal` to deeply compare the two values, ignoring `undefined`.
   *
   * @param expected - The value to compare the received value against.
   * @returns {boolean} `true` if the values are deeply equal, otherwise `false`.
   * @since v1.0.0
   */
  toEqual(expected: any): boolean;

  /**
   * Asserts that the actual value is of a specific type.
   * @param {string} expected - The type to compare against (e.g., "string", "number").
   * @returns {boolean} `true` if the actual value is of the expected type, otherwise `false`.
   */
  toBeTypeOf(expected: string): boolean;

  /**
   * Asserts that the actual value is a string.
   * @returns {boolean} `true` if the actual value is a string, otherwise `false`.
   */
  toBeString(): boolean;

  /**
   * Asserts that the actual value is a number.
   * @returns {boolean} `true` if the actual value is a number, otherwise `false`.
   */
  toBeNumber(): boolean;

  /**
   * Asserts that the actual value is a boolean.
   * @returns {boolean} `true` if the actual value is a boolean, otherwise `false`.
   */
  toBeBoolean(): boolean;

  /**
   * Asserts that the actual value is an array.
   * @returns {boolean} `true` if the actual value is an array, otherwise `false`.
   */
  toBeArray(): boolean;

  /**
   * Asserts that the actual value is an object.
   * @returns {boolean} `true` if the actual value is an object, otherwise `false`.
   */
  toBeObject(): boolean;

  /**
   * Asserts that the actual value is a function.
   * @returns {boolean} `true` if the actual value is a function, otherwise `false`.
   */
  toBeFunction(): boolean;

  /**
   * Asserts that the actual value is null.
   * @returns {boolean} `true` if the actual value is null, otherwise `false`.
   */
  toBeNull(): boolean;

  /**
   * Asserts that the actual value is undefined.
   * @returns {boolean} `true` if the actual value is undefined, otherwise `false`.
   */
  toBeUndefined(): boolean;

  /**
   * Asserts that the actual value is an instance of the expected constructor.
   * @param {Function} expected - The constructor to compare against.
   * @returns {boolean} `true` if the actual value is an instance of the expected constructor, otherwise `false`.
   */
  toBeInstanceOf(expected: Function): boolean;

  /**
   * Asserts that the actual value is greater than the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {boolean} `true` if the actual value is greater, otherwise `false`.
   */
  toBeGreaterThan(expected: number): boolean;

  /**
   * Asserts that the actual value is less than the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {boolean} `true` if the actual value is less, otherwise `false`.
   */
  toBeLessThan(expected: number): boolean;

  /**
   * Asserts that the actual value is truthy.
   * @returns {boolean} `true` if the actual value is truthy, otherwise `false`.
   */
  toBeTruthy(): boolean;

  /**
   * Asserts that the actual value is falsy.
   * @returns {boolean} `true` if the actual value is falsy, otherwise `false`.
   */
  toBeFalsy(): boolean;

  /**
   * Asserts that the actual value contains the expected value.
   * @param {any} expected - The value to check for in the actual value.
   * @returns {boolean} `true` if the actual value contains the expected value, otherwise `false`.
   */
  toContain(expected: any): boolean;

  /**
   * Asserts that the actual object has a specific property.
   * @param {string} prop - The property name.
   * @param {any} [value] - The value to compare against (optional).
   * @returns {boolean} `true` if the property exists and matches the value (if provided), otherwise `false`.
   */
  toHaveProperty(prop: string, value?: any): boolean;

  /**
   * Asserts that the actual function has been called.
   * @returns {boolean} `true` if the function was called, otherwise `false`.
   */
  toHaveBeenCalled(): boolean;

  /**
   * Asserts that the actual function has been called a specific number of times.
   * @param {number} count - The expected number of calls.
   * @returns {boolean} `true` if the function was called the expected number of times, otherwise `false`.
   */
  toHaveBeenCalledTimes(count: number): boolean;

  /**
   * Asserts that the actual function has been called with specific arguments.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {boolean} `true` if the function was called with the expected arguments, otherwise `false`.
   */
  toHaveBeenCalledWith(...args: any[]): boolean;

  /**
   * Asserts that the actual function has been called with specific arguments at a specific call index.
   * @param {number} n - The call index.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {boolean} `true` if the function was called with the expected arguments at the specified index, otherwise `false`.
   */
  toHaveBeenNthCalledWith(n: number, ...args: any[]): boolean;

  /**
   * Asserts that the actual function has been called with specific arguments at the last call.
   * @param {...any} args - The arguments the function should have been called with.
   * @returns {boolean} `true` if the function was called with the expected arguments at the last call, otherwise `false`.
   */
  toHaveBeenLastCalledWith(...args: any[]): boolean;

  /**
   * Asserts that the actual function has returned in its call lifecycle.
   * @returns {boolean} `true` if the function returned, otherwise `false`.
   */
  toHaveReturned(): boolean;

  /**
   * Asserts that the actual function has returned a value a specific number of times.
   * @param {number} count - The expected number of return values.
   * @returns {boolean} `true` if the function returned the expected number of times, otherwise `false`.
   */
  toHaveReturnedTimes(count: number): boolean;

  /**
   * Asserts that the actual function has returned a specific value.
   * @param {any} expected - The value that should have been returned.
   * @returns {boolean} `true` if the function returned the expected value, otherwise `false`.
   */
  toHaveReturnedWith(expected: any): boolean;

  /**
   * Asserts that the actual function has returned the value at the last return.
   * @param {any} expected - The value that should have been returned.
   * @returns {boolean} `true` if the last returned value matches the expected value, otherwise `false`.
   */
  toHaveReturnedLastWith(expected: any): boolean;

  /**
   * Asserts that the actual function has returned the value at a specific return index.
   * @param {number} n - The return index.
   * @param {any} expected - The value that should have been returned.
   * @returns {boolean} `true` if the returned value at the specified index matches the expected value, otherwise `false`.
   */
  toHaveReturnedNthWith(n: number, expected: any): boolean;
}