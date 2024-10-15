/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";

export class RuntimeError extends Error {
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
      this.stack = stack;
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
      char: "N/A",
    };
  }

  /**
   * Overrides the default `toString()` method to pretty print the error.
   * @returns {string} - A custom formatted error string.
   */
  public toString(): string {
    let errorMessage = "";

    // First line that will be used for the dynamic length
    const firstLine = `An Error occurred in test : ${this.description}`;

    // Get the length of the first line to dynamically adjust the length of the "#####" line
    const separator = kleur.bgRed("#".repeat(firstLine.length + 4)); // +4 for extra padding

    // Construct the error message
    const { file, line, char } = this.stackTrace();
    errorMessage += `\n${kleur.bgRed(firstLine)}\n\n`;
    errorMessage += kleur.red(this.message)
    errorMessage += "\n\nStackTrace: \n "
    errorMessage += `\n\tAt: ${kleur.blue(file)} ${kleur.yellow(line)}:${kleur.yellow(char)}\n`;
    

    // Remove the first line from this.stack (which is the error message itself)
    const stackLines = this.stack?.split("\n").slice(1).join("\n") ?? "No stack available"; // Exclude the first line

    // Append the modified stack trace
    errorMessage += `${kleur.gray(stackLines)}\n\n`;

    // Append the dynamic separator
    errorMessage += `${separator}`;

    return errorMessage;
  }

}
