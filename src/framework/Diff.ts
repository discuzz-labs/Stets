/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import diff from "deep-diff";
import kleur from "../utils/kleur.js";

function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

class DiffFormatter {
  private formatRemovedString(str: string): string {
    if (str.includes("\n")) {
      return str
        .split("\n")
        .map((line) => kleur.bgRed(`- ${line}`))
        .join("\n");
    }
    return kleur.bgRed("- " + str);
  }

  private formatAddedString(str: string): string {
    if (str.includes("\n")) {
      return str
        .split("\n")
        .map((line) => kleur.bgGreen(`+ ${line}`))
        .join("\n");
    }
    return kleur.bgGreen("+ " + str);
  }

  public formatDiffString(str: string, isRemoved: boolean): string {
    return isRemoved
      ? this.formatRemovedString(str)
      : this.formatAddedString(str);
  }
}

// More specific type definitions
type Path = (string | number)[];

type Diff<T> = diff.Diff<T, T>;

class CircularReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircularReferenceError";
  }
}

class MaxDepthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaxDepthError";
  }
}

export class Difference {
  // Maximum depth for recursive operations
  MAX_DEPTH = 100;

  private getType(value: unknown): string {
    return {}.toString.call(value).split(" ")[1].slice(0, -1).toLowerCase();
  }

  private isPrimitive(value: unknown): boolean {
    return (
      value === null || // `null` is a primitive
      value === undefined || // `undefined` is a primitive
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "symbol" ||
      typeof value === "bigint"
    );
  }

  private createPathString(path: Path): string {
    return path
      .map((segment) =>
        typeof segment === "number"
          ? `[${segment}]`
          : /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(segment))
            ? segment
            : `["${segment}"]`,
      )
      .join("");
  }

  private detectCircular(obj: unknown, seen = new WeakSet()): boolean {
    if (typeof obj !== "object" || obj === null) return false;

    if (seen.has(obj)) return true;
    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.some((item) => this.detectCircular(item, seen));
    }

    return Object.values(obj).some((value) => this.detectCircular(value, seen));
  }

  deepEqual(value1: any, value2: any, cache = new WeakMap()): boolean {
    // Check if both values are strictly equal (handles primitives and identical references)
    if (value1 === value2) return true;

    // Check if either is null or not an object (at this point we know they're not strictly equal)
    if (
      value1 === null ||
      value2 === null ||
      typeof value1 !== "object" ||
      typeof value2 !== "object"
    ) {
      return false;
    }

    // Use cache to avoid redundant comparisons
    if (cache.has(value1) && cache.get(value1) === value2) return true;
    cache.set(value1, value2);

    // Check if both are arrays
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) return false; // Different lengths
      // Compare each element
      return value1.every((item, index) =>
        this.deepEqual(item, value2[index], cache),
      );
    }

    // Check if both are plain objects
    if (!Array.isArray(value1) && !Array.isArray(value2)) {
      const keys1 = Object.keys(value1);
      const keys2 = Object.keys(value2);

      if (keys1.length !== keys2.length) return false; // Different number of keys

      // Compare each key-value pair
      return keys1.every((key) =>
        this.deepEqual(value1[key], value2[key], cache),
      );
    }

    // If one is an array and the other is not, they are not equal
    return false;
  }

  // Helper function to convert Map and Set to comparable structures
  private convertToComparable(value: any): any {
    if (this.getType(value) === "map") {
      // Convert Map to a plain object
      const obj: Record<string, any> = {};
      (value as Map<any, any>).forEach((v, k) => {
        obj[String(k)] = v; // Ensure the key is a string for object compatibility
      });
      return obj;
    }
    if (this.getType(value) === "set") {
      // Convert Set to an array
      return Array.from(value);
    }
    return value; // Return as is for other types
  }

  // Function to pretty format any value, handling types like Map, Set, Date, RegExp, etc.
  private prettyFormat(
    value: unknown,
    depth: number = 0,
    space: string = "\t",
    seen: WeakSet<object> = new WeakSet(),
  ): string {
    // Prevent circular references by checking if the value has been seen
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]"; // Handle circular reference here
      }
      seen.add(value);
    }

    // Handle primitive values directly
    if (this.isPrimitive(value)) {
      return this.formatPrimitive(value);
    }

    const type = this.getType(value);

    // Handle Date objects
    if (type === "date") {
      return `Date("${(value as Date).toISOString()}")`;
    }

    // Handle Set
    if (type === "set") {
      const setValue = value as Set<unknown>;
      if (setValue.size === 0) return "Set {}";
      let result = "Set {\n";
      for (const [index, item] of Array.from(setValue).entries()) {
        result += `${space.repeat(depth + 1)}[${index}]: ${this.prettyFormat(item, depth + 1, space, seen)}\n`;
      }

      result += `${space.repeat(depth)}}`;
      return result;
    }

    // Handle Map
    if (type === "map") {
      const mapValue = value as Map<unknown, unknown>;
      if (mapValue.size === 0) return "Map {}";
      let result = "Map {\n";
      for (const [key, val] of mapValue) {
        result += `${space.repeat(depth + 1)}[${key}] => ${this.prettyFormat(val, depth + 1, space, seen)}\n`;
      }
      result += `${space.repeat(depth)}}`;
      return result;
    }

    // Handle RegExp
    if (type === "regexp") {
      return `RegExp("${(value as RegExp).source}", "${(value as RegExp).flags}")`;
    }

    // Handle Arrays
    if (type === "array") {
      const arrayValue = value as unknown[];
      if (arrayValue.length === 0) return "Array []";
      let result = "Array [\n";
      for (let i = 0; i < arrayValue.length; i++) {
        result += `${space.repeat(depth + 1)}[${i}]: ${this.prettyFormat(arrayValue[i], depth + 1, space, seen)}`;
        if (i < arrayValue.length - 1) {
          result += ",";
        }
        result += "\n";
      }
      result += `${space.repeat(depth)}]`;
      return result;
    }

    // Handle Objects (plain objects or arrays)
    if (type === "object") {
      const objectValue = value as Record<string, unknown>;
      let result = "Object {\n";
      const keys = Object.keys(objectValue);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        result += `${space.repeat(depth + 1)}"${key}": ${this.prettyFormat(objectValue[key], depth + 1, space, seen)}`;
        if (i < keys.length - 1) {
          result += ",";
        }
        result += "\n";
      }
      result += `${space.repeat(depth)}}`;
      return result;
    }

    // Default to string representation for unsupported types
    return String(value);
  }

  private formatPrimitive(value: unknown): string {
    if (typeof value === "string") {
      return `"${value}"`; // Wrap strings in double quotes
    }
    return String(value); // For other primitives, return their string representation
  }

  private diffObject(
    type: string,
    expected: Record<string, unknown>,
    received: Record<string, unknown>,
    differences: Array<Diff<unknown>>,
    parentPath: Path = [],
    depth = 0,
  ): string {
    if (depth > this.MAX_DEPTH) {
      throw new MaxDepthError(
        `Maximum diff depth of ${this.MAX_DEPTH} exceeded`,
      );
    }

    const formatter = new DiffFormatter();
    let output = `${type} {\n`;
    const indent = "  ".repeat(depth + 1);

    const keys = [
      ...new Set([...Object.keys(expected), ...Object.keys(received)]),
    ];

    for (const key of keys) {
      const path = [...parentPath, key];
      const pathStr = this.createPathString(path);

      const expectedValue = expected[key];
      const receivedValue = received[key];

      const diffsToPath = differences.filter(
        (diff) =>
          diff.path?.length === path.length &&
          diff.path.every((segment, i) => segment === path[i]),
      );

      if (diffsToPath.length > 0) {
        const currentDiff = diffsToPath[0];

        switch (currentDiff.kind) {
          case "N": // New key
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(currentDiff.rhs, depth)}`, false)},\n`;
            break;
          case "D": // Deleted key
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(currentDiff.lhs, depth)}`, true)},\n`;
            break;
          case "E": // Edited key
            const nestedDiff = this.formatDiff(
              currentDiff.lhs,
              currentDiff.rhs,
              depth + 1,
            );

            if (nestedDiff) {
              output += `${indent}${pathStr}: ${nestedDiff},\n`;
            }
            break;
          case "A": // Array modification
            if (
              (this.getType(expectedValue) === "array" ||
                this.getType(expectedValue) === "set") &&
              (this.getType(receivedValue) === "array" ||
                this.getType(receivedValue) === "set")
            ) {
              const arrayDiff = this.diffArray(
                capitalize(this.getType(expectedValue)),
                expectedValue as unknown[],
                receivedValue as unknown[],
                differences,
                path,
                depth + 1,
              );

              output += `${indent}${pathStr}: ${arrayDiff},\n`;
            }
            break;
        }
      } else {
        if (this.deepEqual(expectedValue, receivedValue)) {
          output += `${indent}${pathStr}: ${this.prettyFormat(expectedValue, depth + 1)},\n`;
        } else if (
          this.isPrimitive(expectedValue) &&
          this.isPrimitive(receivedValue) &&
          expectedValue !== receivedValue
        ) {
          output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(expectedValue, depth)}`, true)},\n`;
          output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(receivedValue, depth)}`, false)},\n`;
        } else if (
          !this.isPrimitive(expectedValue) &&
          !this.isPrimitive(receivedValue)
        ) {
          const nestedDiff = this.formatDiff(
            expectedValue,
            receivedValue,
            depth + 1,
          );

          if (nestedDiff) {
            output += `${indent}${pathStr}: ${nestedDiff},\n`;
          }
        }
      }
    }

    output += `${"  ".repeat(depth)}}`;
    return output;
  }

  private diffArray(
    type: string,
    expected: unknown[],
    received: unknown[],
    differences: Array<Diff<unknown>>,
    parentPath: Path = [],
    depth = 0,
  ): string {
    if (depth > this.MAX_DEPTH) {
      throw new MaxDepthError(
        `Maximum diff depth of ${this.MAX_DEPTH} exceeded`,
      );
    }

    const formatter = new DiffFormatter();
    let output = `${type} [\n`;
    const indent = "  ".repeat(depth + 1);

    const maxLength = Math.max(expected.length, received.length);

    for (let i = 0; i < maxLength; i++) {
      const path = [...parentPath, i];
      const pathStr = `[${i}]`;
      const expectedValue = expected[i];
      const receivedValue = received[i];

      const diffsToPath = differences.filter((diff) => {
        if (diff.kind === "A" && diff.index === i) return true;
        return (
          diff.path?.length === path.length &&
          diff.path.every((segment, j) => segment === path[j])
        );
      });

      if (diffsToPath.length > 0) {
        const currentDiff = diffsToPath[0];

        if (currentDiff.kind === "A") {
          const item = currentDiff.item;
          switch (item.kind) {
            case "N":
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(item.rhs, depth)}`, false)},\n`;
              break;
            case "D":
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(item.lhs, depth)}`, true)},\n`;
              break;
            case "E":
              const nestedDiff = this.formatDiff(item.lhs, item.rhs, depth + 1);
              if (nestedDiff) {
                output += `${indent}${pathStr}: ${nestedDiff},\n`;
              } else {
                output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(item.lhs, depth)}`, true)},\n`;
                output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(item.rhs, depth)}`, false)},\n`;
              }
              break;
          }
        } else {
          switch (currentDiff.kind) {
            case "N":
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(currentDiff.rhs, depth)}`, false)},\n`;
              break;
            case "D":
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(currentDiff.lhs, depth)}`, true)},\n`;
              break;
            case "E":
              const nestedDiff = this.formatDiff(
                currentDiff.lhs,
                currentDiff.rhs,
                depth + 1,
              );

              if (nestedDiff) {
                output += `${indent}${pathStr}: ${nestedDiff},\n`;
              } else {
                output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(currentDiff.lhs, depth)}`, true)} ${formatter.formatDiffString(`${this.prettyFormat(currentDiff.rhs, depth)}`, false)},\n`;
              }
              break;
          }
        }
      } else if (i < expected.length && i < received.length) {
        if (this.deepEqual(expectedValue, receivedValue)) {
          output += `${indent}${pathStr}: ${this.prettyFormat(expectedValue, depth)},\n`;
        } else {
          const nestedDiff = this.formatDiff(
            expectedValue,
            receivedValue,
            depth + 1,
          );
          if (nestedDiff) {
            output += `${indent}${pathStr}: ${nestedDiff},\n`;
          } else {
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(expectedValue, depth)}`, true)},\n`;
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(receivedValue, depth)}`, false)},\n`;
          }
        }
      } else if (i >= expected.length) {
        output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(receivedValue, depth)}`, false)},\n`;
      } else {
        output += `${indent}${formatter.formatDiffString(`${pathStr}: ${this.prettyFormat(expectedValue, depth)}`, true)},\n`;
      }
    }

    output += `${"  ".repeat(depth)}]`;
    return output;
  }

  private diffPrimitive(expected: any, received: any): string | undefined {
    const formatter = new DiffFormatter();
    if (expected !== received) {
      return `${formatter.formatDiffString(this.prettyFormat(expected), true)} ${formatter.formatDiffString(this.prettyFormat(received), false)}`;
    }
    return undefined;
  }

  public formatDiff(
    expected: unknown,
    received: unknown,
    depth = 0,
  ): string | undefined {
    const formatter = new DiffFormatter();
    // Check for circular references
    if (this.detectCircular(expected) || this.detectCircular(received)) {
      throw new CircularReferenceError("Circular reference detected in input");
    }

    // Convert Map and Set to objects or arrays before diffing
    const expectedConverted = this.convertToComparable(expected);
    const receivedConverted = this.convertToComparable(received);

    const differences = diff(expectedConverted, receivedConverted);

    if (!differences) return undefined;

    const expectedType = this.getType(expected);
    const receivedType = this.getType(received);

    // If types are different, show the complete change
    if (expectedType !== receivedType) {
      return `${formatter.formatDiffString(this.prettyFormat(expected, depth), true)} ${formatter.formatDiffString(this.prettyFormat(received, depth), false)}`;
    }

    try {
      switch (expectedType) {
        case "object":
          return this.diffObject(
            "Object",
            expectedConverted as Record<string, unknown>,
            receivedConverted as Record<string, unknown>,
            differences,
            [],
            depth,
          );
        case "map":
          return this.diffObject(
            "Map",
            expectedConverted as Record<string, unknown>,
            receivedConverted as Record<string, unknown>,
            differences,
            [],
            depth,
          );
        case "array":
          return this.diffArray(
            "Array",
            expectedConverted as unknown[],
            receivedConverted as unknown[],
            differences,
            [],
            depth,
          );
        case "set":
          return this.diffArray(
            "Set",
            expectedConverted as unknown[],
            receivedConverted as unknown[],
            differences,
            [],
            depth,
          );

        case "date":
          return this.diffPrimitive(
            (expectedConverted as Date).toISOString(),
            (receivedConverted as Date).toISOString(),
          );
        default:
          return this.diffPrimitive(expectedConverted, receivedConverted);
      }
    } catch (error: any) {
      if (
        error instanceof MaxDepthError ||
        error instanceof CircularReferenceError
      ) {
        throw error;
      }
      throw new Error(`Error comparing values: ${error.message}`);
    }
  }
}
