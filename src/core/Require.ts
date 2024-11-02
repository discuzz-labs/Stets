/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import Module, { createRequire } from "module";
import "esbuild-register";

type RequireReturn = { code: string | null; filename: string | null };

export class Require {
  require(filename: string): RequireReturn {
    let convertedContent: RequireReturn = { code: null, filename: null };

    // Backup the original _compile method
    const originalCompile = (Module.prototype as any)._compile;

    // Override the _compile method to intercept transformed code
    (Module.prototype as any)._compile = function (
      content: string,
      filename: string,
    ): void {
      convertedContent = {
        code: content,
          filename: filename,
      };
    };

    try {
      const re = createRequire(filename);
      re(filename); // Require the file, triggering the overridden _compile method
    } catch (error) {
      console.error(`Error loading file ${filename}:`, error);
    } finally {
      // Restore the original _compile method to avoid affecting other modules
      (Module.prototype as any)._compile = originalCompile;
    }

    return convertedContent;
  }
}
