/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import kleur from "../utils/kleur"
import { DiffResult } from "./Diff";

export class DiffStringify{
  private indent: number;
  private pathMap: Map<string, DiffResult>;
  private expected: any; // Corresponds to the expected data
  private received: any; // Corresponds to the received data

  constructor(diff: DiffResult[], expected: any, received: any) {
    this.indent = 2; // Fixed indentation
    this.pathMap = this.createPathMap(diff);
    this.expected = expected;
    this.received = received;
  }

  private incompatibleTypes(expected: any, received: any): boolean {
    return typeof expected !== typeof received ||
           Object.prototype.toString.call(expected) !==
           Object.prototype.toString.call(received);
  }

  private createPathMap(diff: DiffResult[]): Map<string, DiffResult> {
    const pathMap = new Map<string, DiffResult>();
    for (const d of diff) {
      pathMap.set(d.path.join(","), d);
    }
    return pathMap;
  }

  private getCorrespondingValue(path: Array<string | number>): any {
    return path.reduce((acc, segment) => {
      return acc && typeof acc === "object" && segment in acc ? acc[segment] : undefined;
    }, this.received);
  }

  public stringify(value: any, level: number = 1, path: Array<string | number> = []): string {
    if (this.incompatibleTypes(this.expected, this.received)) {
      return `Type mismatch: Expected and received are not the same type`;
    }

    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return this.formatString(value, path);
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return this.formatArray(value, level, path);
    if (value instanceof Map) return this.formatArray(Array.from(value), level, path);
    if (value instanceof Set) return this.formatArray(Array.from(value), level, path);
    if (typeof value === "object") return this.formatObject(value, level, path);

    return String(value);
  }

  private formatString(value: string, path: Array<string | number>): string {
    const currentPathString = path.join(",");
    const foundDiff = this.pathMap.get(currentPathString);
    const expectedOutput = foundDiff?.expected !== undefined ? `${kleur.red(` - ${foundDiff.expected}`)}` : '';
    const receivedOutput = foundDiff?.received !== undefined ? `${kleur.green(` + ${foundDiff.received}`)}` : '';

    return path.length === 0 ? `"${expectedOutput}${receivedOutput}"` : `"${value}"`;
  }

  private formatArray(array: any[], level: number, path: Array<string | number>): string {
    if (array.length === 0) return `Array [ ]`;

    const indentStr = " ".repeat((level + 1) * this.indent);
    const closingIndent = " ".repeat(level * this.indent);
    const items: string[] = [];

    const filteredIndices = Array.from(this.pathMap.keys())
      .filter((key) => key.startsWith(path.join(",")))
      .map((key) => parseInt(key.split(",").pop() || "0"))
      .filter((index) => !isNaN(index));

    const highestIndexInDiff = Math.max(...filteredIndices, array.length - 1);

    for (let index = 0; index <= highestIndexInDiff; index++) {
      const currentPath = [...path, index];
      const currentPathString = currentPath.join(",");
      const foundDiff = this.pathMap.get(currentPathString);
      let expectedOutput = "";
      let receivedOutput = "";

      if (foundDiff) {
        if (foundDiff.expected !== undefined) {
          expectedOutput = `\n${indentStr}${kleur.red(`- ${this.stringify(foundDiff.expected, level + 1, currentPath)}`)}`;
        }
        if (foundDiff.received !== undefined) {
          receivedOutput = `\n${indentStr}${kleur.green(`+ ${this.stringify(foundDiff.received, level + 1, currentPath)}`)}`;
        }
      } else if (index < array.length) {
        const element = array[index];
        const correspondingValue = this.getCorrespondingValue(currentPath);

        if (this.incompatibleTypes(element, correspondingValue)) {
          expectedOutput = `\n${indentStr}${kleur.red(`- ${this.stringify(element, level + 1, currentPath)}`)}`;
          if (correspondingValue !== undefined) {
            receivedOutput = `\n${indentStr}${kleur.green(`+ ${this.stringify(correspondingValue, level + 1, currentPath)}`)}`;
          }
        } else {
          items.push(`\n${indentStr}${this.stringify(element, level + 1, currentPath)}`);
          continue;
        }
      }

      if (expectedOutput || receivedOutput) {
        items.push(`${expectedOutput}${receivedOutput}`);
      }
    }

    return `Array [\n${items.join(",\n")}\n${closingIndent}]`;
  }

  private formatObject(obj: Record<string, any>, level: number, path: Array<string | number>): string {
    const keys = Object.keys(obj);
    const indentStr = " ".repeat((level + 1) * this.indent);
    const closingIndent = " ".repeat(level * this.indent);
    const formattedEntries: string[] = [];
    const uniqueKeys = new Set([...keys, ...Array.from(this.pathMap.keys()).map((p) => p.split(",")[path.length])]);

    for (const key of uniqueKeys) {
      const currentPath = [...path, key];
      const currentPathString = currentPath.join(",");
      const foundDiff = this.pathMap.get(currentPathString);

      if (foundDiff) {
        const receivedOutput = foundDiff.received !== undefined ? 
          `\n${indentStr}${kleur.green(`+ ${key}: ${this.stringify(foundDiff.received, level + 1, currentPath)}`)}` : '';

        const expectedOutput = foundDiff.expected !== undefined ? 
          `\n${indentStr}${kleur.red(`- ${key}: ${this.stringify(foundDiff.expected, level + 1, currentPath)}`)}` : '';

        formattedEntries.push(`${expectedOutput}${receivedOutput}`);
      } else if (key in obj) {
        const currentValue = obj[key];
        const correspondingValue = this.getCorrespondingValue(currentPath);

        if (this.incompatibleTypes(currentValue, correspondingValue)) {
          const expectedOutput = `\n${indentStr}${kleur.red(`- ${key}: ${this.stringify(currentValue, level + 1, currentPath)}`)}`;
          const receivedOutput = `\n${indentStr}${kleur.green(`+ ${key}: ${this.stringify(correspondingValue, level + 1, currentPath)}`)}`;
          formattedEntries.push(`${expectedOutput}${receivedOutput}`);
        } else {
          formattedEntries.push(`\n${indentStr}${key}: ${this.stringify(currentValue, level + 1, currentPath)}`);
        }
      }
    }

    return `Object {\n${formattedEntries.join(",\n")}\n${closingIndent}}`;
  }
}