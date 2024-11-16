/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { getType } from "../utils/index.js";
import kleur from "../utils/kleur.js";
import { prettyFormat } from "../utils/PrettyFormat.js";
import { Difference } from "./Diff.js";

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

function toBe(expected: any, diff: Difference) {
  return function (received: any) {
    const differences = diff.formatDiff(expected, received);
    if (differences) throw new AssertionError(differences, "toBe");
  };
}

function createError(message: string, matcher: string) {
  throw new AssertionError(message, matcher);
}

function toBeTruthy(expected: any) {
  return function () {
    if (!expected) {
      createError(
        `Expected value to be truthy but received ${prettyFormat(expected)}`,
        "toBeTruthy",
      );
    }
  };
}

function toBeFalsy(expected: any) {
  return function () {
    if (expected) {
      createError(
        `Expected value to be falsy but received ${prettyFormat(expected)}`,
        "toBeFalsy",
      );
    }
  };
}

function toBeDefined(expected: any) {
  return function () {
    if (getType(expected) === "undefined" || getType(expected) === "null") {
      createError(
        `Expected value to be defined but received ${prettyFormat(expected)}`,
        "toBeDefined",
      );
    }
  };
}

function toBeUndefined(expected: any) {
  return function () {
    if (getType(expected) !== "undefined") {
      createError(
        `Expected value to be undefined but received ${prettyFormat(expected)}`,
        "toBeUndefined",
      );
    }
  };
}

function toBeNull(expected: any) {
  return function () {
    if (getType(expected) !== null) {
      createError(
        `Expected value to be null but received ${prettyFormat(expected)}`,
        "toBeNull",
      );
    }
  };
}

function toBeNaN(expected: any) {
  return function () {
    if (!Number.isNaN(expected)) {
      createError(
        `Expected value to be NaN but received ${prettyFormat(expected)}`,
        "toBeNaN",
      );
    }
  };
}

function toBeGreaterThan(expected: any) {
  return function (received: number) {
    if (getType(expected) !== "number" || expected <= received) {
      createError(
        `Expected ${prettyFormat(expected)} to be greater than ${prettyFormat(received)}`,
        "toBeGreaterThan",
      );
    }
  };
}

function toBeGreaterThanOrEqual(expected: any) {
  return function (received: number) {
    if (getType(expected) !== "number" || expected < received) {
      createError(
        `Expected ${prettyFormat(expected)} to be greater than or equal to ${prettyFormat(received)}`,
        "toBeGreaterThanOrEqual",
      );
    }
  };
}

function toBeLessThan(expected: any) {
  return function (received: number) {
    if (getType(expected) !== "number" || expected >= received) {
      createError(
        `Expected ${prettyFormat(expected)} to be less than ${prettyFormat(received)}`,
        "toBeLessThan",
      );
    }
  };
}

function toBeLessThanOrEqual(expected: any) {
  return function (received: number) {
    if (getType(expected) !== "number" || expected > received) {
      createError(
        `Expected ${prettyFormat(expected)} to be less than or equal to ${prettyFormat(received)}`,
        "toBeLessThanOrEqual",
      );
    }
  };
}

function toBeCloseTo(expected: any) {
  return function (received: number, precision: number = 2) {
    const multiplier = Math.pow(10, precision);
    const expectedRounded = Math.round(expected * multiplier);
    const receivedRounded = Math.round(received * multiplier);

    if (expectedRounded !== receivedRounded) {
      createError(
        `Expected ${prettyFormat(expected)} to be close to ${prettyFormat(received)} with precision of ${precision} decimal points`,
        "toBeCloseTo",
      );
    }
  };
}

function toBeTypeOf(expected: any) {
  return function (type: string) {
    if (getType(expected) !== type) {
      createError(
        `Expected value to be of type ${type} but received ${getType(expected)}`,
        "toBeTypeOf",
      );
    }
  };
}

function toBeInstanceOf(expected: any) {
  return function (constructor: Function) {
    if (!(expected instanceof constructor)) {
      createError(
        `Expected value to be instance of ${constructor.name}`,
        "toBeInstanceOf",
      );
    }
  };
}

function toBeArray(expected: any) {
  return function () {
    if (!Array.isArray(expected)) {
      createError(
        `Expected value to be an array but received ${getType(expected)}`,
        "toBeArray",
      );
    }
  };
}

function toBeObject(expected: any) {
  return function () {
    if (getType(expected) !== "object" || getType(expected) === null) {
      createError(
        `Expected value to be an object but received ${getType(expected)}`,
        "toBeObject",
      );
    }
  };
}

function toBeString(expected: any) {
  return function () {
    if (getType(expected) !== "string") {
      createError(
        `Expected value to be a string but received ${getType(expected)}`,
        "toBeString",
      );
    }
  };
}

function toBeNumber(expected: any) {
  return function () {
    if (getType(expected) !== "number" || Number.isNaN(expected)) {
      createError(
        `Expected value to be a number but received ${getType(expected)}`,
        "toBeNumber",
      );
    }
  };
}

function toBeBoolean(expected: any) {
  return function () {
    if (getType(expected) !== "boolean") {
      createError(
        `Expected value to be a boolean but received ${getType(expected)}`,
        "toBeBoolean",
      );
    }
  };
}

function toBeFunction(expected: any) {
  return function () {
    if (getType(expected) !== "function") {
      createError(
        `Expected value to be a function but received ${getType(expected)}`,
        "toBeFunction",
      );
    }
  };
}

function toBeRegExp(expected: any) {
  return function () {
    if (getType(expected) !== "regexp") {
      createError(
        `Expected value to be a RegExp but received ${getType(expected)}`,
        "toBeRegExp",
      );
    }
  };
}

function toBeDate(expected: any) {
  return function () {
    if (getType(expected) !== "date" || isNaN(expected.getTime())) {
      createError(
        `Expected value to be a valid Date but received ${prettyFormat(expected)}`,
        "toBeDate",
      );
    }
  };
}

function toBeError(expected: any) {
  return function () {
    if (!(expected instanceof Error)) {
      createError(
        `Expected value to be an Error but received ${typeof expected}`,
        "toBeError",
      );
    }
  };
}

function toBePromise(expected: any) {
  return function () {
    if (getType(expected) !== "promise") {
      createError(
        `Expected value to be a Promise but received ${getType(expected)}`,
        "toBePromise",
      );
    }
  };
}

function toBeAsyncFunction(expected: any) {
  return function () {
    if (getType(expected) !== "asyncfunction") {
      createError(
        `Expected value to be an async function but received ${getType(expected)}`,
        "toBeAsyncFunction",
      );
    }
  };
}

function toBeAsyncGeneratorFunction(expected: any) {
  return function () {
    if (getType(expected) !== "asyncgeneratorfunction") {
      createError(
        `Expected value to be an async generator function but received ${getType(expected)}`,
        "toBeAsyncGeneratorFunction",
      );
    }
  };
}

function toBeGeneratorFunction(expected: any) {
  return function () {
    if (getType(expected) !== "generatorfunction") {
      createError(
        `Expected value to be a generator function but received ${getType(expected)}`,
        "toBeAsyncGeneratorFunction",
      );
    }
  };
}

function toBeIterable(expected: any): () => void {
  return function () {
    if (
      expected === null ||
      expected === undefined ||
      !(Symbol.iterator in Object(expected))
    ) {
      createError(
        `Expected value to be iterable but received ${getType(expected)}`,
        "toBeIterable",
      );
    }
  };
}

function toBeAsyncIterable(expected: any): () => void {
  return function () {
    if (
      expected === null ||
      expected === undefined ||
      !(Symbol.asyncIterator in Object(expected))
    ) {
      createError(
        `Expected value to be async iterable but received ${getType(expected)}`,
        "toBeAsyncIterable",
      );
    }
  };
}

function toEqual(expected: any) {
  return function (received: any) {
    // Use loose equality (==) for comparison
    if (expected != received) {
      createError(
        `Expected ${prettyFormat(expected)} to equal (==) ${prettyFormat(received)}`,
        "toEqual",
      );
    }
  };
}

function toStrictEqual(expected: any) {
  return function (received: any) {
    // Use strict equality (===) for comparison
    if (expected !== received) {
      createError(
        `Expected ${prettyFormat(expected)} to strict equal (===) ${prettyFormat(received)}`,
        "toStrictEqual",
      );
    }
  };
}

function toMatch(expected: any) {
  return function (regex: RegExp) {
    if (!regex.test(expected)) {
      createError(
        `Expected ${prettyFormat(expected)} to match ${prettyFormat(regex)}`,
        "toMatch",
      );
    }
  };
}

function toContain(expected: any) {
  return function (received: any) {
    // Check if the received value is an array or string
    if (getType(expected) === "array") {
      if (!expected.includes(received)) {
        createError(
          `Expected ${prettyFormat(expected)} to contain ${prettyFormat(received)}, but it did not.`,
          "toContain",
        );
      }
    } else if (getType(expected) === "string") {
      if (!expected.includes(received)) {
        createError(
          `Expected ${prettyFormat(expected)} to contain ${prettyFormat(received)}, but it did not.`,
          "toContain",
        );
      }
    } else {
      createError(
        `Expected value to be an array or string, but received ${getType(received)}`,
        "toContain",
      );
    }
  };
}

// Main expect function that supports various matchers
export function expect(expectation: any) {
  const diff = new Difference();

  return {
    toBe: toBe(expectation, diff),
    toBeTruthy: toBeTruthy(expectation),
    toBeFalsy: toBeFalsy(expectation),
    toBeDefined: toBeDefined(expectation),
    toBeUndefined: toBeUndefined(expectation),
    toBeNull: toBeNull(expectation),
    toBeNaN: toBeNaN(expectation),
    toBeGreaterThan: toBeGreaterThan(expectation),
    toBeGreaterThanOrEqual: toBeGreaterThanOrEqual(expectation),
    toBeLessThan: toBeLessThan(expectation),
    toBeLessThanOrEqual: toBeLessThanOrEqual(expectation),
    toBeCloseTo: toBeCloseTo(expectation),
    toBeTypeOf: toBeTypeOf(expectation),
    toBeInstanceOf: toBeInstanceOf(expectation),
    toBeArray: toBeArray(expectation),
    toBeObject: toBeObject(expectation),
    toBeString: toBeString(expectation),
    toBeNumber: toBeNumber(expectation),
    toBeBoolean: toBeBoolean(expectation),
    toBeFunction: toBeFunction(expectation),
    toBeRegExp: toBeRegExp(expectation),
    toBeDate: toBeDate(expectation),
    toBeError: toBeError(expectation),
    toBePromise: toBePromise(expectation),
    toBeAsyncFunction: toBeAsyncFunction(expectation),
    toBeAsyncGeneratorFunction: toBeAsyncGeneratorFunction(expectation),
    toBeGeneratorFunction: toBeGeneratorFunction(expectation),
    toBeIterable: toBeIterable(expectation),
    toBeAsyncIterable: toBeAsyncIterable(expectation),
    toEqual: toEqual(expectation),
    toStrictEqual: toStrictEqual(expectation),
    toMatch: toMatch(expectation),
    toContain: toContain(expectation),
  };
}
