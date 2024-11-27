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
  file: string;
}

export class Transform {
  constructor(
    private readonly options: { plugins: Plugin[]; tsconfig: string },
  ) {}

  async transformMultiple(filenames: string[]): Promise<TransformResult[]> {
    // Validate files exist and transform them together
    const result = await build({
      entryPoints: filenames,
      bundle: false, // Don't bundle, but process all files
      splitting: false,
      format: "cjs",
      sourcemap: "external", // Generate separate sourcemaps
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

    // Process output files
    if (result.outputFiles?.length > 0) {
      // Group output files by their corresponding input file
      const transformResults: TransformResult[] = [];

      for (let i = 0; i < filenames.length; i++) {
        const codeFile = result.outputFiles[i * 2 + 1];
        const mapFile = result.outputFiles[i * 2];

        if (!codeFile || !mapFile) {
          throw new Error(`Failed to process file: ${filenames[i]}`);
        }

        transformResults.push({
          file: filenames[i],
          code: codeFile.text,
          sourceMap: await new SourceMapConsumer(mapFile.text)
        });
      }

      return transformResults;
    } else {
      throw new Error("Failed to generate bundles and sourcemaps");
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
