/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { ErrorInspect } from '../core/ErrorInspect.js';
import { PoolResult } from '../core/Pool.js';

export interface ReporterPlugin {
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
     * Required when the reporter type is `"file"`.
     */
    outputDir?: string;
  }): Promise<void>;
}


export async function report(reports: Map<string, PoolResult>, plugins: ReporterPlugin[]) {
  try {
    // Separate the plugins by type
    const filePlugins = plugins.filter((plugin) => plugin.type === 'file');
    const consolePlugins = plugins.filter((plugin) => plugin.type === 'console');

    // Start running file plugins in the background
    const filePluginsPromise = Promise.all(
      filePlugins.map((plugin) => plugin.report({ reports }))
    );

    // Run console plugins synchronously
    for (const plugin of consolePlugins) {
      await plugin.report({ reports });
    }

    // Wait for file plugins to complete (optional)
    await filePluginsPromise;
  } catch (error: any) {
    console.log(ErrorInspect.format({
      error
    }))
  }
}
