/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import kleur from "./kleur";

interface ParsedStack {
  file?: string;
  methodName?: string;
  arguments?: [];
  lineNumber?: number;
  column?: number;
}

interface ErrorParserOptions {
  maxLines?: number;
  filter?: string;
}

export class ErrorParser {
  private static errorRegex =
    /^\s*at (?!new Script) ?(?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;

  private static formatStackLine(parsed: ParsedStack): string {
    const file = parsed.file?.padEnd(30) || "<UNKNOWN>";
    const lineNumber = parsed.lineNumber ?? 0;
    const column = parsed.column ?? 0;
    return (
      kleur.gray("at") +
      " " +
      kleur.cyan(file) +
      " " +
      kleur.bold(lineNumber.toString()) +
      ":" +
      kleur.bold(column.toString())
    );
  }

  static parseStackLine(line: string): ParsedStack | null {
    const parts = this.errorRegex.exec(line);
    if (!parts) return null;

    return {
      file: parts[2],
      methodName: parts[1] || "<UNKNOWN>",
      arguments: [],
      lineNumber: +parts[3],
      column: parts[4] ? +parts[4] : undefined,
    };
  }

  static parseStack(
    stack: string,
    options: ErrorParserOptions = {},
  ): ParsedStack[] {
    const { maxLines = 5, filter } = options;
    const lines = stack.split("\n").slice(0, maxLines);

    const parsedLines = lines
      .map((line) =>
        filter && !line.includes(filter) ? null : this.parseStackLine(line),
      )
      .filter((parsed): parsed is ParsedStack => parsed !== null);

    // If no lines match the filter, return the entire stack (if a filter was provided)
    if (filter && parsedLines.length === 0) {
      return stack
        .split("\n")
        .map((line) => this.parseStackLine(line))
        .filter((parsed): parsed is ParsedStack => parsed !== null);
    }

    return parsedLines;
  }

  static displayParsedStack(
    stack: string,
    options: ErrorParserOptions = {},
  ): string {
    return this.parseStack(stack, options)
      .map((parsed) => this.formatStackLine(parsed))
      .join("\n");
  }

  static format(
    error: { message: string | undefined; stack: string | undefined },
    options: ErrorParserOptions = {},
  ): string {
    const separator = kleur.gray("-".repeat(process.stdout.columns));
    let result = "";

    if (error.message) {
      result += error.message + "\n";
    }
    if (error.stack) {
      result += this.displayParsedStack(error.stack, options);
    } else {
      result += kleur.red("No stack trace available!");
    }

    return separator + "\n" + result + "\n" + separator;
  }
}
