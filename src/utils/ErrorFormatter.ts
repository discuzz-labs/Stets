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
  private nodeRe =   /^\s*at (?!new Script) ?(?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;

  private generateLineWithData(): string {
    const terminalWidth = process.stdout.columns || 80; // Default to 80 if terminal width is not available
    const totalLength = " ERROR ".length + 10; // Calculate total space taken by error, dashes, and time
    const dashesLength = terminalWidth - totalLength;
    const dashes = "─".repeat(dashesLength > 0 ? dashesLength : 0); // Create dashes to fill remaining space
    return " " + kleur.white(dashes) + " " 
  }

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

  public async format(message: string, stack: string): Promise<string> {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const parsedStack = this.parse(stack);

    if (parsedStack.length > 0) {
      const { file, lineNumber, column } = parsedStack[0];

      if (file && lineNumber && column) {
        return new Promise((resolve, reject) => {
          this.readLine(file, lineNumber, (err, line) => {
            if (err) {
              reject(err);
            }
            const formattedError =
              `${kleur.bgRed(" ERROR ")}${this.generateLineWithData()}\n` +
              `${message}\n\n` +
              `${kleur.gray(file)} ${kleur.bold(lineNumber)}:${kleur.bold(column)}\n` +
              `${lineNumber} │ ${line.trim()}\n` +
              `${" ".repeat(lineNumber.toString().length)} │ ${" ".repeat(column - 1)}${kleur.red("~~~~~")}\n`;
            resolve(formattedError);
          });
        });
      }
    }

    return Promise.resolve(message);
  }
}
