import esbuild from "esbuild";
import { SourceMapConsumer } from "source-map";

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
  file?: string;
  sourceMap?: SourceMapConsumer;
}

export class ErrorInspect {
  private static regex =
    /^\s*at (?!new Script) ?(?:([^\(]+) )?\(?([^:]+):(\d+):(\d+)\)?\s*$/i;

  private static formatLine(
    parsed: ParsedStack,
    options: ErrorInspectOptions,
  ): string {
    const file = parsed.file?.padEnd(30) || "";
    const line = parsed.lineNumber ?? 0;
    const column = parsed.column ?? 0;

    const original = options.sourceMap?.originalPositionFor({
      line,
      column,
    });

    return `→ ${file} ${original?.line || line}:${original?.column || column}`;
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
    const lines = stack.split("\n").slice(0);

    return lines
      .map((line) =>
        options.file && !line.includes(options.file) ? null : this.parse(line),
      )
      .filter((parsed): parsed is ParsedStack => parsed !== null);
  }

  private static show(stack: string, options: ErrorInspectOptions): string {
    const parsedStack = this.stack(stack, options);
    return parsedStack
      .map((parsed) => this.formatLine(parsed, options))
      .join("");
  }

  private static formatBuildMessages(
    messages: any[],
    type: "error" | "warning",
  ): string {
    if (!Array.isArray(messages) || messages.length === 0) return "";

    const formattedMessages = esbuild.formatMessagesSync(messages, {
      kind: type,
      color: false, // Disable colors for cleaner output
    });

    return formattedMessages.map((msg) => `${msg.trim()}`).join("\n");
  }

  static format(options: ErrorInspectOptions): string {
    const divider = "─".repeat(60);
    const header = options.error?.message || "No message available.";
    const body = options.error?.stack
      ? this.show(options.error.stack, options)
      : "No stack trace available\n";

    let buildOutput = "";
    if (options.error) {
      const { errors = [], warnings = [] } = options.error as any;
      const errorMessages = this.formatBuildMessages(errors, "error");
      const warningMessages = this.formatBuildMessages(warnings, "warning");

      buildOutput = [errorMessages, warningMessages]
        .filter(Boolean)
        .join("\n\n")
        .trim();
    }

    const output = [divider, buildOutput || `${header}\n\n${body}`, divider].join(
      "\n",
    );

    return output;
  }
}
