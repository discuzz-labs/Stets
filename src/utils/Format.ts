/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { getType } from "./index.js";

interface FormatOptions {
  indent?: number;
  maxDepth?: number;
  maxArrayLength?: number;
  maxStringLength?: number;
  showHidden?: boolean;
}

export class Format {
  indent: number = 2;
  maxDepth: number = Infinity;
  maxArrayLength: number = Infinity;
  maxStringLength: number = Infinity;
  showHidden: boolean = false;

  constructor(options: FormatOptions = {}) {
    this.indent = options.indent || 2;
    this.maxDepth = options.maxDepth || 10;
    this.maxArrayLength = options.maxArrayLength || 100;
    this.maxStringLength = options.maxStringLength || 1000;
    this.showHidden = options.showHidden || false;
  }

  format(value: any, depth = 0): string {
    if (depth > this.maxDepth) {
      return "[Maximum depth exceeded]";
    }

    if (value === null) {
      return "null";
    }

    if (value === undefined) {
      return "undefined";
    }

    if (getType(value) === "string") {
      return this.formatString(value);
    }

    if (getType(value) === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (getType(value) === "bigint") {
      return `${value}n`;
    }

    if (getType(value) === "symbol") {
      return value.toString();
    }

    if (getType(value) === "date") {
      return this.formatDate(value);
    }

    if (getType(value) === "regexp") {
      return value.toString();
    }

    if (value instanceof Error) {
      return this.formatError(value);
    }

    if (Array.isArray(value)) {
      return this.formatArray(value, depth);
    }

    if (getType(value) === "set") {
      return this.formatSet(value, depth);
    }

    if (getType(value) === "map") {
      return this.formatMap(value, depth);
    }

    if (getType(value) === "function") {
      return this.formatFunction(value);
    }

    if (getType(value) === "object") {
      return this.formatObject(value, depth);
    }

    return String(value);
  }

  formatString(value: string) {
    if (value.length > this.maxStringLength) {
      value = value.slice(0, this.maxStringLength) + "...";
    }
    return `"${value.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }

  formatDate(value: Date) {
    return `new Date("${value.toISOString()}")`;
  }

  formatError(value: Error) {
    return `${value.name}: ${value.message}`;
  }

  formatArray(arr: any[], depth: number) {
    if (arr.length === 0) {
      return "Array []";
    }

    if (arr.length > this.maxArrayLength) {
      arr = arr.slice(0, this.maxArrayLength);
    }

    const indent = " ".repeat((depth + 1) * this.indent);
    const closingIndent = " ".repeat(depth * this.indent);

    const elements = arr
      .map((item) => `${indent}${this.format(item, depth + 1)}`)
      .join(",\n");

    return `Array [\n${elements}${arr.length > this.maxArrayLength ? ",\n" + indent + "..." : ""}\n${closingIndent}]`;
  }

  formatSet(set: Set<any>, depth: number) {
    if (set.size === 0) {
      return "Set()";
    }

    const indent = " ".repeat((depth + 1) * this.indent);
    const closingIndent = " ".repeat(depth * this.indent);

    const elements = Array.from(set)
      .map((item) => `${indent}${this.format(item, depth + 1)}`)
      .join(",\n");

    return `Set([\n${elements}\n${closingIndent}])`;
  }

  formatMap(map: Map<any, any>, depth: number) {
    if (map.size === 0) {
      return "Map{}";
    }

    const indent = " ".repeat((depth + 1) * this.indent);
    const closingIndent = " ".repeat(depth * this.indent);

    const elements = Array.from(map.entries())
      .map(
        ([key, value]) =>
          `${indent}[${this.format(key, depth + 1)}, ${this.format(value, depth + 1)}]`,
      )
      .join(",\n");

    return `new Map{[\n${elements}\n${closingIndent}]}`;
  }

  formatFunction(fn: Function): string {
    // Convert the function to a string
    let str = fn.toString();

    // Truncate the function string if it exceeds the maximum length
    const maxLength = this.maxStringLength || 100; // Fallback to 100 if maxStringLength is undefined
    if (str.length > maxLength) {
      str = str.slice(0, maxLength) + "...";
    }

    // Return a formatted string representation
    return `Function ${str}`;
  }

  formatObject(obj: any, depth: number) {
    const keys = this.showHidden
      ? Object.getOwnPropertyNames(obj)
      : Object.keys(obj);

    if (keys.length === 0) {
      return "{}";
    }

    const indent = " ".repeat((depth + 1) * this.indent);
    const closingIndent = " ".repeat(depth * this.indent);

    const properties = keys
      .map((key) => {
        const value = obj[key];
        const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : this.formatString(key);
        return `${indent}${formattedKey}: ${this.format(value, depth + 1)}`;
      })
      .join(",\n");

    return `{\n${properties}\n${closingIndent}}`;
  }
}
