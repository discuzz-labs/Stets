/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export class TestError extends Error {
  description: string;

  constructor({
    description,
    message,
    stack,
  }: {
    description: string;
    message: string;
    stack?: string;
  }) {
    super(message);
    this.description = description;

    if (stack) {
      this.stack = stack; // Override stack if provided
    }
  }

  /**
   * Parses the stack trace to extract file path, line number, and character position.
   * @returns {string} - The formatted stack trace as "File: line:char".
   */
  public stackTrace(): {
    file: string;
    char: string;
    line: string;
  } {
    const stackLine = this.stack?.split("\n")[1]; // Get the first relevant line from the stack trace
    const stackRegex = /\((.*):(\d+):(\d+)\)/; // Regex to extract file, line, and char info

    const match = stackLine?.match(stackRegex);
    if (match) {
      const [, file, line, char] = match;

      return { file, line, char };
    }

    return {
      file: "N/A",
      line: "N/A",
      char: "N/A"
    };
  }
}