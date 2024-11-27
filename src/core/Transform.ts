/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { build, Plugin } from "esbuild";
import { SourceMapConsumer } from "source-map";
import { Tsconfig } from "../config/types";

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

  /**
   * Transform a file and all its imports into a single bundled string
   */
  async transform(filename: string): Promise<TransformResult> {
    // Validate file exists
    const result = await build({
      entryPoints: [filename],
      bundle: true,
      write: false,
      minify: false,
      sourcesContent: true,
      format: "cjs",
      sourcemap: "external",
      outdir: "dist",
      logLevel: "silent",
      loader: this.getLoaderConfig(),
      plugins:
        this.options.plugins.length > 0 ? this.options.plugins : undefined,
      tsconfigRaw: Object.keys(this.options.tsconfig).length > 0 ? {
        compilerOptions: {
          alwaysStrict: this.options.tsconfig.alwaysStrict,
          baseUrl: this.options.tsconfig.baseUrl,
          experimentalDecorators: this.options.tsconfig.experimentalDecorators,
          importsNotUsedAsValues: this.options.tsconfig.importsNotUsedAsValues,
          jsx: this.options.tsconfig.jsx,
          jsxFactory: this.options.tsconfig.jsxFactory,
          jsxFragmentFactory: this.options.tsconfig.jsxFragmentFactory,
          jsxImportSource: this.options.tsconfig.jsxImportSource,
          paths: this.options.tsconfig.paths,
          preserveValueImports: this.options.tsconfig.preserveValueImports,
          strict: this.options.tsconfig.strict,
          useDefineForClassFields:
            this.options.tsconfig.useDefineForClassFields,
          verbatimModuleSyntax: this.options.tsconfig.verbatimModuleSyntax,
        },
      } : {}
    });

    if (result.outputFiles?.length >= 2) {
      // outputFiles[0] contains the bundled code
      // outputFiles[1] contains the sourcemap
      const bundledCode = result.outputFiles[1].text;
      const sourceMap = result.outputFiles[0].text;

      return {
        code: bundledCode,
        sourceMap: await new SourceMapConsumer(sourceMap),
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
