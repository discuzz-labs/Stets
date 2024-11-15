/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { promises as fs } from "fs";
import { build, Plugin } from "esbuild";

export class Transform {
  private plugins: Plugin[] = [];

  constructor(plugins: Plugin[]) {
    this.plugins = plugins;
  }

  /**
   * Transform a file and all its imports into a single bundled string
   */
  async transform(filename: string): Promise<string> {
    // Validate file exists
    await fs.access(filename);

    // Use esbuild's build API to bundle the file with plugins
    const result = await build({
      entryPoints: [filename],
      bundle: true,
      format: "cjs",
      sourcemap: true,
      minify: false,
      write: false, // Prevent output to disk
      treeShaking: true,
      loader: this.getLoaderConfig(),
      plugins: this.plugins.length > 0 ? this.plugins : undefined,
    });

    if (result.outputFiles?.length) {
      const bundledCode = result.outputFiles[0].text;

      return bundledCode;
    } else {
      throw new Error("Failed to bundle file")
    }
  }

  /**
   * Determine the loader configuration for esbuild
   */
  private getLoaderConfig(): Record<string, "js" | "ts" | "jsx" | "tsx"> {
    return {
      ".ts": "ts",
      ".tsx": "tsx",
      ".js": "js",
      ".jsx": "jsx",
    };
  }
}
