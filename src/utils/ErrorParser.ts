/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "./kleur.js";
import esbuild from "esbuild";
import fs from "fs";

interface ParsedStack {
  file?: string;
  methodName?: string;
  arguments?: any[];
  lineNumber?: number;
  column?: number;
}

export interface ErrorMetadata {
  message: string | undefined;
  stack: string | undefined;
}

interface ErrorParserOptions {
  error: ErrorMetadata | Error | undefined;
  maxLines?: number;
  file?: string;
}

interface ErrorContext {
  previousLine: string;
  errorLine: string;
  nextLine: string;
  column: number;
}

export class ErrorParser {
  private static errorRegex =
    /^\s*at (?!new Script) ?(?:([^\(]+) )?\(?([^:]+):(\d+):(\d+)\)?\s*$/i;

  private static readFileContext(
    filePath: string,
    lineNumber: number,
  ): ErrorContext | null {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const lines = fileContent.split("\n");

      // Adjust line number to 0-based index
      const targetLine = lineNumber - 1;

      if (targetLine < 0 || targetLine >= lines.length) {
        return null;
      }

      return {
        previousLine: lines[targetLine - 1] || "",
        errorLine: lines[targetLine],
        nextLine: lines[targetLine + 1] || "",
        column: 0, // Will be set later
      };
    } catch (error) {
      return null;
    }
  }

  private static formatErrorContext(
    context: ErrorContext,
    lineNumber: number,
  ): string {
    const lineNumWidth = String(lineNumber + 1).length;
    const padNum = (num: number) => String(num).padStart(lineNumWidth);

    const previousLineNum = lineNumber - 1;
    const nextLineNum = lineNumber + 1;

    let output = "";

    // Previous line
    if (context.previousLine) {
      output += `\n${kleur.gray(padNum(previousLineNum))} | ${context.previousLine}\n`;
    }

    // Error line with pointer
    output += `${kleur.red(padNum(lineNumber))} | ${kleur.bgLightRed(context.errorLine)}\n`;
    // Next line
    if (context.nextLine) {
      output += `${kleur.gray(padNum(nextLineNum))} | ${context.nextLine}\n`;
    }

    return output;
  }

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
      methodName: parts[1] || "<UNKNOWN>",
      file: parts[2],
      lineNumber: +parts[3],
      column: +parts[4],
    };
  }

  static parseStack(stack: string, options: ErrorParserOptions): ParsedStack[] {
    const { maxLines = 5, file } = options;
    const lines = stack.split("\n").slice(0, maxLines);
    const parsedLines = lines
      .map((line) =>
        file && !line.includes(file) ? null : this.parseStackLine(line),
      )
      .filter((parsed): parsed is ParsedStack => parsed !== null);

    if (file && parsedLines.length === 0) {
      return stack
        .split("\n")
        .map((line) => this.parseStackLine(line))
        .filter((parsed): parsed is ParsedStack => parsed !== null);
    }
    return parsedLines;
  }

  static displayParsedStack(
    stack: string,
    options: ErrorParserOptions,
  ): string {
    const parsedStack = this.parseStack(stack, options);
    let output = "";

    for (const parsed of parsedStack) {
      output += "\n"+this.formatStackLine(parsed);

      if (parsed.file && parsed.lineNumber) {
        const context = this.readFileContext(parsed.file, parsed.lineNumber);
        if (context) {
          context.column = parsed.column || 0;
          output += this.formatErrorContext(context, parsed.lineNumber);
        }
      }
    }
    return output;
  }

  static format(options: ErrorParserOptions): string {
    const separator = kleur.gray("-".repeat(process.stdout.columns));
    let result = "";

    if (
      options.error?.hasOwnProperty("errors") ||
      options.error?.hasOwnProperty("warning")
    ) {
      const kind = options.error.hasOwnProperty("errors") ? "error" : "warning";
      const messages = esbuild.formatMessagesSync(
        (options.error as any).errors,
        {
          kind,
          terminalWidth: process.stdout.columns,
          color: true,
        },
      );
      result += messages.join("\n").trim();
    } else {
      result += options.error?.message
        ? options.error.message + "\n"
        : "No Error Message was provided";

      result += options.error?.stack
        ? this.displayParsedStack(options.error.stack, options)
        : kleur.red("No stack trace available!");
    }

    return `${separator}\n${result}\n${separator}`;
  }
}
