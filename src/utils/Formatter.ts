/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "./kleur";

interface ParsedStack {
  file: string;
  methodName: string;
  arguments: string[];
  lineNumber: number;
  column: number | null;
}

export class Formatter {
  private static nodeRe =
    /^\s*at (?!new Script) ?(?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;

  static parseStackLine(line: string): ParsedStack | null {
    const parts = this.nodeRe.exec(line);
    if (!parts) return null;

    return {
      file: parts[2],
      methodName: parts[1] || "<UNKNOWN>",
      arguments: [],
      lineNumber: +parts[3],
      column: parts[4] ? +parts[4] : null,
    };
  }

  static parseStack(
    stack: string,
    maxStack?: number,
    filterFile?: string,
  ): void {
    console.log("");

    const stackLines = stack.split("\n");

    let displayedLines = 0; // Track how many lines have been displayed

    for (const line of stackLines) {
      if (maxStack && displayedLines >= maxStack) break; // Stop if maxStack limit is reached

      const parsed = this.parseStackLine(line);
      if (parsed) {
        // If filterFile is set, check if the file path contains it
        if (!filterFile || parsed.file.includes(filterFile)) {
          console.log(
            `${kleur.gray("at")} ${parsed.file}\t${kleur.bold(parsed.lineNumber)}:${kleur.bold(parsed.column as number)}`,
          );
          displayedLines++;
        }
      }
    }
  }

  static formatError(
    message: string,
    stack: string,
    maxStack?: number,
    filterFile?: string,
  ): void {
    console.log(kleur.gray("-".repeat(process.stdout.columns)));
    console.log(message);
    this.parseStack(stack, maxStack, filterFile);
    console.log(kleur.gray("-".repeat(process.stdout.columns)));
  }
}
