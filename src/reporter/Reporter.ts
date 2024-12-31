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

/**
 * Configuration options for generating a report.
 *
 * @interface ReportOptions
 */
export interface ReportOptions {
  /**
   * A map containing report data where:
   * The key is a unique string identifier for the report
   * The value is an object of type `PoolResult`
   *
   * @type {Map<string, PoolResult>}
   */
  reports: Map<string, PoolResult>;

  /**
   * The directory where the report should be saved.
   * This is required if the reporter type is `"file"`. If not provided, the report may be logged to the console.
   *
   * @type {string | undefined}
   */
  outputDir?: string;

  /**
   * Additional configuration options for the report generation.
   * You can pass custom settings based on the reporter's needs, such as a custom format or logging level.
   *
   * @type {object}
   */
  [key: string]: any;
}

/**
 * A reporter plugin responsible for generating and outputting reports.
 *
 * @interface Reporter
 */
export interface Reporter {
  /** Name of the reporter plugin. This is typically a descriptive name, e.g., "FileReporter".
   *
   * @type {string}
   */
  name: string;

  /**
   * The type of the reporter plugin, which determines how the report is generated and output.
   *
   * @type {('file' | 'console')}
   */
  type: "file" | "console";

  /**
   * Generates a report based on the provided options.
   *
   * @param {ReportOptions} options - Configuration for generating the report.
   * @returns {Promise<any>} A `Promise` that resolves when the report is successfully generated. If an error occurs, it should be thrown.
   * @throws {Error} If there is an issue generating the report (e.g., missing required output directory for file-based reports).
   *
   */
  report(options: ReportOptions): Promise<any>;
}

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
