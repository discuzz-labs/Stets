/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export class Expectation {
  /**
   * Negates the assertion.
   * @returns {Expectation} A new `Expectation` instance with negation applied.
   * @since v1.0.0
   * @example
   * expect(5).not.toBe(10);
   */
  get not(): Expectation;

  /**
   * Waits for the promise to resolve and performs the assertion on its value.
   * @returns {Expectation} A promise that resolves to an `Expectation` instance.
   * @since v1.0.0
   * @example
   * await expect(Promise.resolve(5)).resolves.toBe(5);
   */
  get resolves(): Expectation;

  /**
   * Waits for the promise to reject and performs the assertion on its rejection reason.
   * @returns {Expectation} A promise that resolves to an `Expectation` instance.
   * @since v1.0.0
   * @example
   * await expect(Promise.reject(new Error("Oops"))).rejects.toThrow("Oops");
   */
  get rejects(): Expectation;

  /**
   * Asserts that the actual value is strictly equal to the expected value.
   * @param {any} expected - The value to compare with the actual value.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(42).toBe(42);
   */
  toBe(expected: any): this;

  /**
   * Asserts that the actual value is loosely equal to the expected value.
   * @param {any} expected - The value to compare with the actual value.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect("42").toEqual(42);
   */
  toEqual(expected: any): this;

  /**
   * Asserts that the actual value is truthy.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(true).toBeTruthy();
   */
  toBeTruthy(): this;

  /**
   * Asserts that the actual value is falsy.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(false).toBeFalsy();
   */
  toBeFalsy(): this;

  /**
   * Asserts that the actual value is null.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(null).toBeNull();
   */
  toBeNull(): this;

  /**
   * Asserts that the actual value is undefined.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(undefined).toBeUndefined();
   */
  toBeUndefined(): this;

  /**
   * Asserts that the actual value is defined (not null or undefined).
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(42).toBeDefined();
   */
  toBeDefined(): this;

  /**
   * Asserts that the actual value is an instance of the expected constructor.
   * @param {Function} expected - The constructor to compare against.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(new Date()).toBeInstanceOf(Date);
   */
  toBeInstanceOf(expected: Function): this;

  /**
   * Asserts that the actual value matches a regular expression.
   * @param {RegExp} expected - The regular expression to match.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect("hello").toMatch(/ell/);
   */
  toMatch(expected: RegExp): this;

  /**
   * Asserts that the actual value contains the expected value.
   * @param {any} expected - The value to check for in the actual value.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect([1, 2, 3]).toContain(2);
   */
  toContain(expected: any): this;

  /**
   * Asserts that the actual value is close to the expected number within precision.
   * @param {number} expected - The expected number.
   * @param {number} [precision=2] - The precision to use for comparison.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(3.141).toBeCloseTo(3.14, 2);
   */
  toBeCloseTo(expected: number, precision?: number): this;

  /**
   * Asserts that the actual value is an object.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect({}).toBeObject();
   */
  toBeObject(): this;

  /**
   * Asserts that the actual value is a function.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(() => {}).toBeFunction();
   */
  toBeFunction(): this;

  /**
   * Asserts that the actual value is an async iterable.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(async function*() {}).toBeAsyncIterable();
   */
  toBeAsyncIterable(): this;

  /**
   * Asserts that the actual value is iterable.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect([1, 2, 3]).toBeIterable();
   */
  toBeIterable(): this;

  /**
   * Asserts that the actual value is a Promise.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(Promise.resolve()).toBePromise();
   */
  toBePromise(): this;

  /**
   * Asserts that the actual value is an async function.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(async () => {}).toBeAsyncFunction();
   */
  toBeAsyncFunction(): this;

  /**
   * Asserts that the actual value is an async generator function.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(async function*() {}).toBeAsyncGeneratorFunction();
   */
  toBeAsyncGeneratorFunction(): this;

  /**
   * Asserts that the actual value is a generator function.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(function*() {}).toBeGeneratorFunction();
   */
  toBeGeneratorFunction(): this;

  /**
   * Asserts that the actual value is an array.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect([1, 2, 3]).toBeArray();
   */
  toBeArray(): this;

  /**
   * Asserts that the actual value is a string.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect("hello").toBeString();
   */
  toBeString(): this;

  /**
   * Asserts that the actual value is a number.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(5).toBeNumber();
   */
  toBeNumber(): this;

  /**
   * Asserts that the actual value is a boolean.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(true).toBeBoolean();
   */
  toBeBoolean(): this;

  /**
   * Asserts that the actual value is a RegExp.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(/abc/).toBeRegExp();
   */
  toBeRegExp(): this;

  /**
   * Asserts that the actual value is a Date.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(new Date()).toBeDate();
   */
  toBeDate(): this;

  /**
   * Asserts that the actual value is an Error instance.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(new Error()).toBeError();
   */
  toBeError(): this;

  /**
   * Asserts that the actual value is greater than the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(10).toBeGreaterThan(5);
   */
  toBeGreaterThan(expected: number): this;

  /**
   * Asserts that the actual value is greater than or equal to the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(10).toBeGreaterThanOrEqual(10);
   */
  toBeGreaterThanOrEqual(expected: number): this;

  /**
   * Asserts that the actual value is less than the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(5).toBeLessThan(10);
   */
  toBeLessThan(expected: number): this;

  /**
   * Asserts that the actual value is less than or equal to the expected value.
   * @param {number} expected - The value to compare against.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect(5).toBeLessThanOrEqual(5);
   */
  toBeLessThanOrEqual(expected: number): this;

  /**
   * Asserts that the actual value is of a specific type.
   * @param {string} expected - The type to compare against (e.g., "string", "number").
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect("hello").toBeTypeOf("string");
   */
  toBeTypeOf(expected: string): this;

  /**
   * Asserts that the actual value has a specific length.
   * @param {number} expected - The expected length.
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect([1, 2, 3]).toHaveLength(3);
   */
  toHaveLength(expected: number): this;

  /**
   * Asserts that the actual object has a specific property.
   * @param {string} prop - The property name.
   * @param {any} [value] - The value to compare against (optional).
   * @returns {Expectation} The current `Expectation` instance.
   * @since v1.0.0
   * @example
   * expect({ a: 1 }).toHaveProperty("a");
   */
  toHaveProperty(prop: string, value?: any): this;
}

/**
 * Creates an expectation for assertions.
 * @param {any} actual - The value to assert.
 * @returns {Expectation} A new `Expectation` instance.
 * @since v1.0.0
 * @example
 * expect(42).toBe(42);
 */
export function expectation(actual: any): Expectation;

export {};
