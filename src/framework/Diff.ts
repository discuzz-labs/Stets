/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import diff from "deep-diff";
import kleur from "../utils/kleur.js";
import { getType, deepEqual, isPrimitive } from "../utils/index.js";
import { prettyFormat } from "../utils/PrettyFormat.js";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

  // Helper function to convert Map and Set to comparable structures
  private convertToComparable(value: any): any {
    if (getType(value) === "map") {
      // Convert Map to a plain object
      const obj: Record<string, any> = {};
      (value as Map<any, any>).forEach((v, k) => {
        obj[String(k)] = v; // Ensure the key is a string for object compatibility
      });
      return obj;
    }
    if (getType(value) === "set") {
      // Convert Set to an array
      return Array.from(value);
    }
    return value; // Return as is for other types
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
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(currentDiff.rhs, depth)}`, false)},\n`;
            break;
          case "D": // Deleted key
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(currentDiff.lhs, depth)}`, true)},\n`;
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
              (getType(expectedValue) === "array" ||
                getType(expectedValue) === "set") &&
              (getType(receivedValue) === "array" ||
                getType(receivedValue) === "set")
            ) {
              const arrayDiff = this.diffArray(
                capitalize(getType(expectedValue)),
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
        if (deepEqual(expectedValue, receivedValue)) {
          output += `${indent}${pathStr}: ${prettyFormat(expectedValue, depth + 1)},\n`;
        } else if (
          isPrimitive(expectedValue) &&
          isPrimitive(receivedValue) &&
          expectedValue !== receivedValue
        ) {
          output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(expectedValue, depth)}`, true)},\n`;
          output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(receivedValue, depth)}`, false)},\n`;
        } else if (!isPrimitive(expectedValue) && !isPrimitive(receivedValue)) {
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
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(item.rhs, depth)}`, false)},\n`;
              break;
            case "D":
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(item.lhs, depth)}`, true)},\n`;
              break;
            case "E":
              const nestedDiff = this.formatDiff(item.lhs, item.rhs, depth + 1);
              if (nestedDiff) {
                output += `${indent}${pathStr}: ${nestedDiff},\n`;
              } else {
                output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(item.lhs, depth)}`, true)},\n`;
                output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(item.rhs, depth)}`, false)},\n`;
              }
              break;
          }
        } else {
          switch (currentDiff.kind) {
            case "N":
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(currentDiff.rhs, depth)}`, false)},\n`;
              break;
            case "D":
              output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(currentDiff.lhs, depth)}`, true)},\n`;
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
                output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(currentDiff.lhs, depth)}`, true)} ${formatter.formatDiffString(`${prettyFormat(currentDiff.rhs, depth)}`, false)},\n`;
              }
              break;
          }
        }
      } else if (i < expected.length && i < received.length) {
        if (deepEqual(expectedValue, receivedValue)) {
          output += `${indent}${pathStr}: ${prettyFormat(expectedValue, depth)},\n`;
        } else {
          const nestedDiff = this.formatDiff(
            expectedValue,
            receivedValue,
            depth + 1,
          );
          if (nestedDiff) {
            output += `${indent}${pathStr}: ${nestedDiff},\n`;
          } else {
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(expectedValue, depth)}`, true)},\n`;
            output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(receivedValue, depth)}`, false)},\n`;
          }
        }
      } else if (i >= expected.length) {
        output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(receivedValue, depth)}`, false)},\n`;
      } else {
        output += `${indent}${formatter.formatDiffString(`${pathStr}: ${prettyFormat(expectedValue, depth)}`, true)},\n`;
      }
    }

    output += `${"  ".repeat(depth)}]`;
    return output;
  }

  private diffPrimitive(expected: any, received: any): string | undefined {
    const formatter = new DiffFormatter();
    if (expected !== received) {
      return `${formatter.formatDiffString(prettyFormat(expected), true)} ${formatter.formatDiffString(prettyFormat(received), false)}`;
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

    const expectedType = getType(expected);
    const receivedType = getType(received);

    // If types are different, show the complete change
    if (expectedType !== receivedType) {
      return `${formatter.formatDiffString(prettyFormat(expected, depth), true)} ${formatter.formatDiffString(prettyFormat(received, depth), false)}`;
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
