/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import chalk from 'chalk';

export class TestFailedError extends Error {
  description: string;

  constructor({ errorName, testDescription, message, stack }: 
    { errorName: string, testDescription: string, message: string, stack?: string }) {
    super(message);
    this.name = errorName;
    this.description = testDescription;

    if (stack) {
      this.stack = stack;  // Override stack if provided
    }
  }

  /**
   * Parses the stack trace to extract file path, line number, and character position.
   * @returns {string} - The formatted stack trace as "File: line:char".
   */
  private parseStack(): string {
    const stackLine = this.stack?.split('\n')[1]; // Get the first relevant line from the stack trace
    const stackRegex = /\((.*):(\d+):(\d+)\)/;    // Regex to extract file, line, and char info

    const match = stackLine?.match(stackRegex);
    if (match) {
      const [ , filePath, line, char ] = match;
      return `${chalk.blue(filePath)} ${chalk.yellow(line)}:${chalk.yellow(char)}`;
    }

    return this.stack
  }

  public logError(): string {
    const parsedStack = this.parseStack();  // Get the formatted stack trace

    return `
${chalk.red("•")} Test: ${chalk.gray(this.description)} 
${chalk.yellow(this.message)}

At: ${parsedStack}
    `;
  }
}