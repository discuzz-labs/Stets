import kleur from "../utils/kleur.js";
import esbuild from "esbuild";
import fs from "fs";

interface ParsedStack {
  file?: string;
  lineNumber?: number;
  column?: number;
}

export interface ErrorMetadata {
  message: string | undefined;
  stack: string | undefined;
}

interface ErrorInspectOptions {
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

export class ErrorInspect {
  private static regex =
    /^\s*at (?!new Script) ?(?:([^\(]+) )?\(?([^:]+):(\d+):(\d+)\)?\s*$/i;

  private static read(
    filePath: string,
    lineNumber: number,
  ): ErrorContext | null {
    try {
      const lines = fs.readFileSync(filePath, "utf-8").split("\n");
      const target = lineNumber - 1;
      if (target < 0 || target >= lines.length) return null;
      return {
        previousLine: lines[target - 1] || "",
        errorLine: lines[target],
        nextLine: lines[target + 1] || "",
        column: 0,
      };
    } catch {
      return null;
    }
  }

  private static formatContext(
    context: ErrorContext,
    lineNumber: number,
  ): string {
    const lineNumWidth = String(lineNumber + 1).length;
    const pad = (num: number) => String(num).padStart(lineNumWidth);

    return (
      (context.previousLine
        ? kleur.gray(pad(lineNumber - 1)) + " | " + context.previousLine + "\n"
        : "") +
      kleur.red(pad(lineNumber)) +
      " | " +
      kleur.bgLightRed(context.errorLine) +
      "\n" +
      (context.nextLine
        ? kleur.gray(pad(lineNumber + 1)) + " | " + context.nextLine + "\n"
        : "")
    );
  }

  private static formatLine(parsed: ParsedStack): string {
    const file = parsed.file?.padEnd(30) || "<UNKNOWN>";
    const line = parsed.lineNumber ?? 0;
    const column = parsed.column ?? 0;

    return (
      kleur.gray("at") +
      " " +
      kleur.cyan(file) +
      " " +
      kleur.bold(line.toString()) +
      ":" +
      kleur.bold(column.toString())
    );
  }

  private static parse(line: string): ParsedStack | null {
    const parts = this.regex.exec(line);
    if (!parts) return null;

    return {
      file: parts[2],
      lineNumber: +parts[3],
      column: +parts[4],
    };
  }

  private static stack(
    stack: string,
    options: ErrorInspectOptions,
  ): ParsedStack[] {
    const lines = stack.split("\n").slice(0, options.maxLines || 5);

    return lines
      .map((line) =>
        options.file && !line.includes(options.file) ? null : this.parse(line),
      )
      .filter((parsed): parsed is ParsedStack => parsed !== null);
  }

  private static show(stack: string, options: ErrorInspectOptions): string {
    const parsedStack = this.stack(stack, options);

    return parsedStack
      .map((parsed) => {
        const line = this.formatLine(parsed);
        if (!parsed.file || !parsed.lineNumber) return line;

        const context = this.read(parsed.file, parsed.lineNumber);
        if (!context) return line;

        context.column = parsed.column || 0;
        return line + this.formatContext(context, parsed.lineNumber);
      })
      .join("\n");
  }

  private static buildMessages(
    messages: any[],
    kind: "error" | "warning",
  ): string[] {
    if (Array.isArray(messages) && messages.length > 0) {
      return esbuild.formatMessagesSync(messages, { kind, color: true });
    }
    return [];
  }

  static format(options: ErrorInspectOptions): string {
    const separator = kleur.gray("-".repeat(process.stdout.columns));
    const header = options.error?.message || "No Error Message was provided";
    const body = options.error?.stack
      ? this.show(options.error.stack, options)
      : kleur.red("No stack trace available!");

    // Build error and warning messages
    let buildMessages = "";
    if (options.error) {
      const { errors = [], warnings = [] } = options.error as any;
      const errorMessages = this.buildMessages(errors, "error");
      const warningMessages = this.buildMessages(warnings, "warning");
      buildMessages = [errorMessages, warningMessages]
        .filter(Boolean)
        .join("\n\n")
        .trim();
    }

    // Return either buildMessages or the fallback (header + body)
    return (
      separator +
      "\n" +
      (buildMessages || header + "\n" + body) +
      "\n" +
      separator
    );
  }
}
