/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { build, Plugin } from "esbuild";
import { SourceMapConsumer } from "source-map";
import { Tsconfig } from "../config/Config.js";

interface TransformResult {
  code: string;
  sourceMap: SourceMapConsumer;
}

export class Transform {
  constructor(
    private readonly options: {
      plugins: Plugin[];
      tsconfig: Tsconfig;
    },
  ) {}

  async transform(file: string): Promise<TransformResult> {
    // Validate files exist and transform them together
    const result = await build({
      entryPoints: [file],
      bundle: false, // Don't bundle, but process all files
      splitting: false,
      format: "cjs",
      sourcemap: "external", // Generate separate sourcemaps

      write: false,
      minify: false,
      sourcesContent: true,
      outdir: "dist",
      logLevel: "silent",
      loader: this.getLoaderConfig(),
      plugins:
        this.options.plugins.length > 0 ? this.options.plugins : undefined,
      tsconfigRaw:
        Object.keys(this.options.tsconfig).length > 0
          ? {
              compilerOptions: {
                alwaysStrict: this.options.tsconfig.alwaysStrict,
                baseUrl: this.options.tsconfig.baseUrl,
                experimentalDecorators:
                  this.options.tsconfig.experimentalDecorators,
                importsNotUsedAsValues:
                  this.options.tsconfig.importsNotUsedAsValues,
                jsx: this.options.tsconfig.jsx,
                jsxFactory: this.options.tsconfig.jsxFactory,
                jsxFragmentFactory: this.options.tsconfig.jsxFragmentFactory,
                jsxImportSource: this.options.tsconfig.jsxImportSource,
                paths: this.options.tsconfig.paths,
                preserveValueImports:
                  this.options.tsconfig.preserveValueImports,
                strict: this.options.tsconfig.strict,
                useDefineForClassFields:
                  this.options.tsconfig.useDefineForClassFields,
                verbatimModuleSyntax:
                  this.options.tsconfig.verbatimModuleSyntax,
              },
            }
          : {},
    });

    // Process output files
    if (result.outputFiles?.length > 0) {
      // Group output files by their corresponding input file
      const bundledCode = result.outputFiles[1].text;
      const sourceMap = result.outputFiles[0].text;

      return {
        code: bundledCode,
        sourceMap: await new SourceMapConsumer(sourceMap),
      };
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
