/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { getType, isPrimitive } from "./index.js";

function formatPrimitive(value: unknown): string {
  if (typeof value === "string") {
    return `"${value}"`; // Wrap strings in double quotes
  }
  return String(value); // For other primitives, return their string representation
}

export function prettyFormat(
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
  if (isPrimitive(value)) {
    return formatPrimitive(value);
  }

  const type = getType(value);

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
      result += `${space.repeat(depth + 1)}[${index}]: ${prettyFormat(item, depth + 1, space, seen)}\n`;
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
      result += `${space.repeat(depth + 1)}[${key}] => ${prettyFormat(val, depth + 1, space, seen)}\n`;
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
      result += `${space.repeat(depth + 1)}[${i}]: ${prettyFormat(arrayValue[i], depth + 1, space, seen)}`;
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
      result += `${space.repeat(depth + 1)}"${key}": ${prettyFormat(objectValue[key], depth + 1, space, seen)}`;
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