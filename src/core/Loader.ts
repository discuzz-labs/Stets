/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import Module, { createRequire } from "module";
import "esbuild-register";

export class Loader {
  require(filename: string): string | null {
    let convertedContent: string | null = null

    // Backup the original _compile method
    const originalCompile = (Module.prototype as any)._compile;

    // Override the _compile method to intercept transformed code
    (Module.prototype as any)._compile = function (
      content: string,
      filename: string,
    ): void {
      convertedContent = content
    };

    try {
      const re = createRequire(filename);
      re(filename); // Require the file, triggering the overridden _compile method
    } finally {
      // Restore the original _compile method to avoid affecting other modules
      (Module.prototype as any)._compile = originalCompile;
    }

    return convertedContent;
  }
}
