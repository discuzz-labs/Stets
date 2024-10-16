/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as esbuild from "esbuild";
import fs from "fs";

// Cache to avoid re-compiling the same file
const cache = new Map();

// @ts-ignore
require.extensions[".ts"] = (module: any, filename: any) => {
  // Check if the file has already been compiled and cached
  if (cache.has(filename)) {
    module._compile(cache.get(filename), filename);
    process.exit(0);
  } else {
    try {
      // Read and transform the file using esbuild
      const result: esbuild.TransformResult = esbuild.transformSync(
        fs.readFileSync(filename, "utf-8"),
        {
          loader: "ts",         // Specify TypeScript loader
          target: "node21",      // Ensure it matches Node.js version
          sourcemap: true,       // Optional: to generate source maps
          format: "cjs",         // Force CommonJS output format
        }
      );

      // Cache the compiled code
      cache.set(filename, result.code);

      // Use the original filename for module compilation
      module._compile(result.code, filename);

    } catch (err: any) {
      if (err.errors && (err as esbuild.TransformFailure).errors.length > 0) {
        let output = "";
        let formatted = esbuild.formatMessagesSync(err.errors, {
          kind: "error",
          color: true,
        });

        formatted.forEach((str) => {
          output += "\n  " + str;
        });

        // Send error details to the parent process
        process.send?.({ type: "buildError", error: output });
        process.exit(1);
      } else {
        // Send generic error if it's not an esbuild error
        process.send?.({ type: "buildError", error: `${err.stack}` });
        process.exit(1);
      }
    }
  }
};
