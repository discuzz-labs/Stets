/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { getType } from "../utils/index.js";
import kleur from "../utils/kleur.js";
import { prettyFormat } from "../utils/PrettyFormat.js";
import { Difference } from "./Diff.js";
import { Spy } from "./Spy.js";

class AssertionError extends Error {
  constructor(message: any, methodName: string) {
    const header =
      kleur.gray("expect" + "(expected)" + ".") +
      kleur.bold(methodName) +
      kleur.gray("(received)") +
      "\n\n";
    super(header + message);
    this.name = "AssertionError";
  }
}

class Expectation {
  private actual: any;
  private isNot: boolean;

  constructor(actual: any) {
    this.actual = actual;
    this.isNot = false
  }

  /**
   * Creates a negated version of the matcher
   */
  get not() {
    this.isNot = !this.isNot;
    return this;
  }

  /**
   * Handles promise resolution and rejection for async assertions
   */
  get resolves() {
    if (!(getType(this.actual) === "promise")) {
      throw new Error(".resolves can only be used with a Promise.");
    }

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === "not") return target.not;
        return async (...args: any[]) => {
          try {
            const resolvedValue = await this.actual;
            target.actual = resolvedValue as any;
            return (target as any)[prop](...args);
          } catch (err) {
            throw new Error(
              `Expected Promise to resolve but it rejected with: ${err}`,
            );
          }
        };
      },
    });
  }

  get rejects() {
    if (!(getType(this.actual) === "promise")) {
      throw new Error(".rejects can only be used with a Promise.");
    }

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === "not") return target.not;
        return async (...args: any[]) => {
          try {
            await this.actual;
            throw new Error("Expected Promise to reject but it resolved.");
          } catch (err: any) {
            target.actual = err; // Update actual value to the rejection reason
            return (target as any)[prop](...args);
          }
        };
      },
    });
  }

  /**
   * Creates an assertion error with a descriptive message
   */
  private assert(
    condition: boolean,
    {
      message,
      expected = null,
      matcher,
    }: {
      message: string;
      expected?: any;
      matcher: string;
    },
  ) {
    const passes = this.isNot ? !condition : condition;

    if (!passes) {
      const formattedActual = prettyFormat(this.actual);
      const formattedExpected = expected !== null ? prettyFormat(expected) : "";
      const notStr = this.isNot ? "not " : "";

      let errorMessage = `Expected ${formattedActual} ${notStr}${message}`;
      if (expected !== null) {
        errorMessage += ` ${formattedExpected}`;
      }

      throw new AssertionError(errorMessage, matcher);
    }
  }

  toBeAsyncIterable() {
    this.assert(
      this.actual !== null ||
        this.actual !== undefined ||
        Symbol.asyncIterator in Object(this.actual),
      {
        message: "to be asnyciterable",

        matcher: "toBeAsyncIterable",
      },
    );
    return this;
  }

  toBeIterable() {
    this.assert(
      this.actual !== null ||
        this.actual !== undefined ||
        Symbol.iterator in Object(this.actual),
      {
        message: "to be iterable",

        matcher: "toBeIterable",
      },
    );
    return this;
  }

  toBePromise() {
    this.assert(getType(this.actual) === "promise", {
      message: "to be promise",

      matcher: "toBePromise",
    });
    return this;
  }

  toBeAsyncFunction() {
    this.assert(getType(this.actual) === "asyncfunction", {
      message: "to be async function",

      matcher: "toBeAsyncFunction",
    });
    return this;
  }

  toBeAsyncGeneratorFunction() {
    this.assert(getType(this.actual) === "asyncgeneratorfunction", {
      message: "to be async generator function",

      matcher: "toBeAsyncGeneratorFunction",
    });
    return this;
  }

  toBeGeneratorFunction() {
    this.assert(getType(this.actual) === "generatorfunction", {
      message: "to be generator function",

      matcher: "toBeGeneratorFunction",
    });
    return this;
  }

  toBeArray() {
    this.assert(getType(this.actual) === "array", {
      message: "to be an array",

      matcher: "toBeArray",
    });
    return this;
  }

  toBeObject() {
    this.assert(getType(this.actual) === "object", {
      message: "to be an object",

      matcher: "toBeObject",
    });
    return this;
  }

  toBeString() {
    this.assert(getType(this.actual) === "string", {
      message: "to be a string",

      matcher: "toBeString",
    });
    return this;
  }

  toBeNumber() {
    this.assert(getType(this.actual) === "number", {
      message: "to be a number",

      matcher: "toBeNumber",
    });
    return this;
  }

  toBeBoolean() {
    this.assert(getType(this.actual) === "boolean", {
      message: "to be a boolean",

      matcher: "toBeBoolean",
    });
    return this;
  }

  toBeFunction() {
    this.assert(getType(this.actual) === "function", {
      message: "to be a function",

      matcher: "toBeFunction",
    });
    return this;
  }

  toBeRegExp() {
    this.assert(getType(this.actual) === "regexp", {
      message: "to be a regexp",

      matcher: "toBeRegExp",
    });
    return this;
  }

  toBeDate() {
    this.assert(getType(this.actual) === "date", {
      message: "to be a date",

      matcher: "toBeDate",
    });
    return this;
  }

  toBeError(expected: any) {
    this.assert(this.actual instanceof Error, {
      message: "to be an Error",
      expected,
      matcher: "toBeError",
    });
    return this;
  }

  /**
   * Strict equality comparison using ===
   */
  toBe(expected: any) {
    const diff = new Difference().formatDiff(this.actual, expected);
    this.assert(diff === undefined, {
      message:
        getType(expected) === getType(this.actual) ? "to be " + diff : "to be",
      expected,
      matcher: "toBe",
    });
    return this;
  }

  /**
   * Loose equality comparison using ==
   */
  toEqual(expected: any) {
    // eslint-disable-next-line eqeqeq
    this.assert(this.actual == expected, {
      message: "to equal",
      expected,
      matcher: "toEqual",
    });
    return this;
  }

  /**
   * Checks if value is truthy
   */
  toBeTruthy() {
    this.assert(Boolean(this.actual), {
      message: "to be truthy",
      matcher: "toBeTruthy",
    });
    return this;
  }

  /**
   * Checks if value is falsy
   */
  toBeFalsy() {
    this.assert(!this.actual, {
      message: "to be falsy",
      matcher: "toBeFalsy",
    });
    return this;
  }

  /**
   * Checks if value is null
   */
  toBeNull() {
    this.assert(this.actual === null, {
      message: "to be null",
      matcher: "toBeNull",
    });
    return this;
  }

  /**
   * Checks if value is undefined
   */
  toBeUndefined() {
    this.assert(this.actual === undefined, {
      message: "to be undefined",
      matcher: "toBeUndefined",
    });
    return this;
  }

  /**
   * Checks if value is defined (not null or undefined)
   */
  toBeDefined() {
    this.assert(this.actual !== null && this.actual !== undefined, {
      message: "to be defined",
      matcher: "toBeDefined",
    });
    return this;
  }

  /**
   * Checks if number is greater than expected
   */
  toBeGreaterThan(expected: number) {
    this.assert(getType(this.actual) === "number" && this.actual > expected, {
      message: "to be greater than",
      expected,
      matcher: "toBeGreaterThan",
    });
    return this;
  }

  /**
   * Checks if number is greater than or equal to expected
   */
  toBeGreaterThanOrEqual(expected: number) {
    this.assert(getType(this.actual) === "number" && this.actual >= expected, {
      message: "to be greater than or equal to",
      expected,
      matcher: "toBeGreaterThanOrEqual",
    });
    return this;
  }

  /**
   * Checks if number is less than expected
   */
  toBeLessThan(expected: number) {
    this.assert(getType(this.actual) === "number" && this.actual < expected, {
      message: "to be less than",
      expected,
      matcher: "toBeLessThan",
    });
    return this;
  }

  /**
   * Checks if number is less than or equal to expected
   */
  toBeLessThanOrEqual(expected: number) {
    this.assert(getType(this.actual) === "number" && this.actual <= expected, {
      message: "to be less than or equal to",
      expected,
      matcher: "toBeLessThanOrEqual",
    });
    return this;
  }

  /**
   * Checks if value matches a type
   */
  toBeTypeOf(expected: string) {
    this.assert(getType(this.actual) === expected, {
      message: "to be of type",
      expected,
      matcher: "toBeTypeOf",
    });
    return this;
  }

  /**
   * Checks if value is instance of expected constructor
   */
  toBeInstanceOf(expected: Function) {
    this.assert(this.actual instanceof expected, {
      message: "to be instance of",
      expected: expected.name,
      matcher: "toBeInstanceOf",
    });
    return this;
  }

  /**
   * Checks if value matches regex pattern
   */
  toMatch(expected: RegExp) {
    this.assert(
      getType(this.actual) === "string" && expected.test(this.actual),
      {
        message: "to match pattern",
        expected,
        matcher: "toMatch",
      },
    );
    return this;
  }

  /**
   * Checks if array or string contains expected value
   */
  toContain(expected: any) {
    const isValidType =
      Array.isArray(this.actual) || getType(this.actual) === "string";
    const contains = isValidType && this.actual.includes(expected);

    this.assert(contains, {
      message: "to contain",
      expected,
      matcher: "toContain",
    });
    return this;
  }

  /**
   * Checks if value is close to expected number within precision
   */
  toBeCloseTo(expected: number, precision: number = 2) {
    const multiplier = Math.pow(10, precision);
    const actualRounded = Math.round(this.actual * multiplier);
    const expectedRounded = Math.round(expected * multiplier);

    this.assert(actualRounded === expectedRounded, {
      message: `to be close to (within ${precision} decimal places)`,
      expected,
      matcher: "toBeCloseTo",
    });
    return this;
  }

  /**
   * Checks if value has specific length
   */
  toHaveLength(expected: number) {
    this.assert(
      (Array.isArray(this.actual) || getType(this.actual) === "string") &&
        this.actual.length === expected,
      {
        message: "to have length",
        expected,
        matcher: "toHaveLength",
      },
    );
    return this;
  }

  /**
   * Checks if object has specific property
   */
  toHaveProperty(prop: string, value?: any) {
    const hasProperty = Object.prototype.hasOwnProperty.call(this.actual, prop);
    const matchesValue = value === undefined || this.actual[prop] === value;

    this.assert(hasProperty && matchesValue, {
      message:
        value === undefined
          ? `to have property "${prop}"`
          : `to have property "${prop}" with value`,
      expected: value,
      matcher: "toHaveProperty",
    });
    return this;
  }

  /**
   * Checks if array or object is empty
   */
  toBeEmpty() {
    let isEmpty = false;

    if (Array.isArray(this.actual) || getType(this.actual) === "string") {
      isEmpty = this.actual.length === 0;
    } else if (getType(this.actual) === "object" && this.actual !== null) {
      isEmpty = Object.keys(this.actual).length === 0;
    }

    this.assert(isEmpty, {
      message: "to be empty",
      matcher: "toBeEmpty",
    });
    return this;
  }

  /**
   * Checks if function throws when executed
   */
  toThrow(expected?: string | RegExp | Error) {
    if (getType(this.actual) !== "function") {
      throw new AssertionError(
        "toThrow() can only be used with functions",
        "toThrow",
      );
    }

    let thrown: Error | null = null;
    try {
      this.actual();
    } catch (err: any) {
      thrown = err;
    }

    if (expected !== undefined) {
      if (expected instanceof RegExp) {
        this.assert(thrown !== null && expected.test(thrown.message), {
          message: "to throw error matching",
          expected,
          matcher: "toThrow",
        });
      } else if (expected instanceof Error) {
        this.assert(
          thrown !== null && thrown.constructor === expected.constructor,
          {
            message: "to throw error instance of",
            expected: expected.constructor.name,
            matcher: "toThrow",
          },
        );
      } else {
        this.assert(thrown !== null && thrown.message === expected, {
          message: "to throw error with message",
          expected,
          matcher: "toThrow",
        });
      }
    } else {
      this.assert(thrown !== null, {
        message: "to throw",
        matcher: "toThrow",
      });
    }
    return this;
  }

  toHaveBeenCalled() {
    
    return this;
  }
}

/**
 * Main expect function that creates new Expectation instance
 */
export function expect(actual: any) {
  return new Expectation(actual);
}
