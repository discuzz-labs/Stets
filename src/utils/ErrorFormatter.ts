/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "./kleur";
import fs, { PathLike } from "fs";
import readline from "readline";

type Callback = (err: Error | null, content: string) => void;

interface ParsedStack {
  file: string;
  methodName: string;
  arguments: string[];
  lineNumber: number;
  column: number | null;
}

export class ErrorFormatter {
  private nodeRe =
    /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;

  // Method to calculate terminal width and generate a line with data
  private generateLineWithData(data: string): string {
    const terminalWidth = process.stdout.columns || 80; // Default to 80 if terminal width is not available
    const totalLength = " ERROR ".length + data.length + 6; // Calculate total space taken by error, dashes, and time
    const dashesLength = terminalWidth - totalLength;
    const dashes = "─".repeat(dashesLength > 0 ? dashesLength : 0); // Create dashes to fill remaining space
    return " " + kleur.white(dashes) + " " + kleur.gray(data);
  }

  // Parse the stack string into structured data
  private parse(stackString: string): ParsedStack[] {
    const lines = stackString.split("\n");
    return lines.reduce((stack: ParsedStack[], line: string) => {
      const parseResult = this.parseNode(line);
      if (parseResult) {
        stack.push(parseResult);
      }
      return stack;
    }, []);
  }

  // Parse a single line in the stack trace
  private parseNode(line: string): ParsedStack | null {
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

  // Format the error with a highlighted pointer showing the exact position
  private formatHighlightedError(
    file: string,
    lineNumber: number,
    column: number,
    line: string,
  ): void {
    const pointerLine = " ".repeat(column - 1) + kleur.red("~~~~~"); // Caret to indicate the error position
    process.stdout.write(
      kleur.gray(file) +
        " " +
        kleur.bold(lineNumber) +
        ":" +
        kleur.bold(column) +
       "\n"
    );
    process.stdout.write(lineNumber + " │ " + line.trim() + "\n");
    process.stdout.write(
      " ".repeat(lineNumber.toString().length) + " │ " + pointerLine  + "\n\n",
    );
  }

  // Read a specific line from a file
  private async readLine(path: PathLike, row: number, callback: Callback) {
    let i = 0;
    let content = "";
    const rs = fs
      .createReadStream(path, { encoding: "utf8", autoClose: false })
      .on("error", (err) => {
        rs.destroy();
        callback(err, content);
      });

    const rl = readline.createInterface({ input: rs, terminal: false });

    rl.on("line", (line) => {
      if (++i === row) {
        content = line;
        rl.close();
      }
    })
      .on("close", () => {
        rs.destroy();
        callback(null, content);
      })
      .on("error", (err) => {
        rs.destroy();
        callback(err, content);
      });
  }

  // Public method to format the error and print a parsed stack trace
  public async format(message: string, stack: string) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const formattedTime = hours + ":" + minutes; // Format HH:MM

    // Parse the error stack
    const parsedStack = this.parse(stack);

    // Print the formatted error header with the time
    process.stdout.write(
       "\n" +
        kleur.bgRed(" ERROR ") +
        this.generateLineWithData(formattedTime) +
        "\n\n",
    );

    // Print the error message

    process.stdout.write(message + "\n\n",);

    // Print the parsed stack trace
    if (parsedStack.length > 0) {
      const { file, lineNumber, column } = parsedStack[0];

      if (file && lineNumber && column) {
        await this.readLine(file, lineNumber, (err, line) => {
          if (err) {
            return;
          }
          this.formatHighlightedError(file, lineNumber, column, line);
        });
      }
    }
  }
}
