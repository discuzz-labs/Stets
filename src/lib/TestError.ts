/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import path from "path";
import { File } from "../utils/File";

export class TestFailedError extends Error {
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
  public async stackTrace(): Promise<{
    file: string;
    char: string;
    line: string;
    affectedLine: string;
  }> {
    const stackLine = this.stack?.split("\n")[1]; // Get the first relevant line from the stack trace
    const stackRegex = /\((.*):(\d+):(\d+)\)/; // Regex to extract file, line, and char info

    const match = stackLine?.match(stackRegex);
    if (match) {
      const [, file, line, char] = match;
      const affectedLine: string | null = await new File(file).readLine(
        parseInt(line),
      );

      return { file, line, char, affectedLine: affectedLine ? affectedLine : "" };
    }

    return {
      file: "Unknown",
      line: "0",
      char: "0",
      affectedLine: ""
    };
  }
}
