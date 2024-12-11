/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import path from "node:path";
import {
  ErrorInspect,
  ErrorInspectOptions,
  ErrorMetadata,
} from "../core/ErrorInspect.js";
import { PoolResult } from "../core/Pool.js";

export interface ReporterPlugin {
  reporter: Reporter;
  options?: Record<any, any>;
}

export interface Reporter {
  /** Name of the reporter plugin */
  name: string;

  /**
   * The type of the reporter plugin.
   *
   * - `"file"`: Writes the report to a file.
   * - `"console"`: Outputs the report to the console.
   */
  type: "file" | "console";

  /**
   * Generates a report based on the provided options.
   *
   * @param {Object} options - Configuration for generating the report.
   * @param {Map<string, PoolResult>} options.reports - A map containing report data where the key is a string identifier and the value is a `PoolResult`.
   * @param {string} [options.outputDir] - Directory where the report should be saved. Required if the plugin type is `"file"`.
   *
   * @example
   * const plugin: ReporterPlugin = {
   *   name: "FileReporter",
   *   type: "file",
   *   report: async (options) => {
   *     console.log("Generating report...");
   *     // Implementation here...
   *   },
   * };
   *
   * @returns {Promise<void>} Resolves when the report is successfully generated.
   */
  report(options: {
    /**
     * A map containing report data where:
     * - The key is a unique string identifier for the report.
     * - The value is an object of type `PoolResult`.
     */
    reports: Map<string, PoolResult>;

    /**
     * The directory where the report should be saved.
     */
    outputDir?: string;

    [key: string]: any;
  }): Promise<void>;
}

// Validation logic for `veve.reporters`

export async function report(
  reports: Map<string, PoolResult>,
  plugins: ReporterPlugin[],
  output: string,
) {
  try {
    const outputDir = path.join(process.cwd(), output);
    // Separate the plugins by type
    const filePlugins = plugins.filter(
      (plugin) => plugin.reporter.type === "file",
    );
    const consolePlugins = plugins.filter(
      (plugin) => plugin.reporter.type === "console",
    );

    // Start running file plugins in the background
    const filePluginsPromise = Promise.all(
      filePlugins.map((plugin) =>
        plugin.reporter.report({ outputDir, ...plugin.options, reports }),
      ),
    );

    // Run console plugins synchronously
    for (const plugin of consolePlugins) {
      await plugin.reporter.report({ outputDir, ...plugin.options, reports });
    }

    // Wait for file plugins to complete (optional)
    await filePluginsPromise;
  } catch (error: any) {
    console.log(
      ErrorInspect.format({
        error,
      }),
    );
  }
}
