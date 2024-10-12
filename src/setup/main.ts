/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

// Patch console methods or other global settings
export function traceConsoleMethod(originalMethod: (...args: any[]) => void, methodName: string) {
  return function (...args: any[]) {
    const error = new Error();
    const stackLine = error.stack?.split("\n")[2]; // Get the caller line from the stack trace
    const stackRegex = /\((.*):(\d+):(\d+)\)/; // Regex to extract file, line, and char info
    const match = stackLine?.match(stackRegex);

    if (match) {
      const [, file, line, char] = match;
      const traceInfo = `[${methodName} called at ${file}:${line}:${char}]`;

      originalMethod.call(console, traceInfo, ...args);
    } else {
      originalMethod.call(console, ...args);
    }
  };
}