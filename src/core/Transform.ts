/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { build, Plugin } from "esbuild";
import path from "path";
import { SourceMapConsumer } from "source-map";

interface TransformResult {
  code: string;
  sourceMap: SourceMapConsumer;
}

export class Transform {
  constructor(
    private readonly options: { plugins: Plugin[]; tsconfig: string },
  ) {}

  /**
   * Transform a file and all its imports into a single bundled string
   */
  async transform(filename: string): Promise<TransformResult> {
    // Validate file exists
    const result = await build({
      entryPoints: [filename],
      bundle: true,
      format: "cjs",
      sourcemap: "external", // Generate separate sourcemap
      write: false,
      outdir: "dist",
      loader: this.getLoaderConfig(),
      minify: false,
      plugins:
        this.options.plugins.length > 0 ? this.options.plugins : undefined,
      tsconfig:
        this.options.tsconfig !== ""
          ? path.join(process.cwd(), this.options.tsconfig)
          : undefined,
      logLevel: "silent",
      sourcesContent: true, // Ensure full source content is included
    });

    if (result.outputFiles?.length >= 2) {
      // outputFiles[0] contains the bundled code
      // outputFiles[1] contains the sourcemap
      const bundledCode = result.outputFiles[1].text;
      const sourceMap = result.outputFiles[0].text;

      return {
        code: bundledCode,
        sourceMap: await new SourceMapConsumer(sourceMap)
      };
    } else {
      throw new Error("Failed to generate bundle and sourcemap");
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
