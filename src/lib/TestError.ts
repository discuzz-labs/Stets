/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import chalk from "chalk";
import { File } from "../utils/File";

export class TestFailedError extends Error {
  description: string;

  constructor({
    errorName,
    testDescription,
    message,
    stack,
  }: {
    errorName: string;
    testDescription: string;
    message: string;
    stack?: string;
  }) {
    super(message);
    this.name = errorName;
    this.description = testDescription;

    if (stack) {
      this.stack = stack; // Override stack if provided
    }
  }

  /**
   * Parses the stack trace to extract file path, line number, and character position.
   * @returns {string} - The formatted stack trace as "File: line:char".
   */
  private async parseStack(): Promise<string> {
    const stackLine = this.stack?.split("\n")[1]; // Get the first relevant line from the stack trace
    const stackRegex = /\((.*):(\d+):(\d+)\)/; // Regex to extract file, line, and char info

    const match = stackLine?.match(stackRegex);
    if (match) {
      const [, filePath, line, char] = match;
      const affectedLine: string | null = await new File(filePath).readLine(
        parseInt(line),
      );

      if (affectedLine) {
        // Create a pointer to mark the specific character in the affected line
        const pointer = " ".repeat(parseInt(char) - 1) + chalk.red("^");

        return `${chalk.blue(filePath)} ${chalk.yellow(line)}:${chalk.yellow(char)}
${chalk.gray(affectedLine)}
${pointer}`;
      }
    }

    return this.stack || "No stack trace available";
  }

  public async logError(): Promise<string> {
    const parsedStack = await this.parseStack(); // Get the formatted stack trace

    return `
${chalk.red("•")} Test: ${chalk.gray(this.description)} 
${chalk.yellow(this.message)}

At: ${parsedStack}
    `;
  }
}
