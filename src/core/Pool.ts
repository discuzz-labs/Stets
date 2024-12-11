/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Console, LogEntry } from "./Console.js";
import { TestReport } from "../framework/TestCase";
import { Isolated } from "./Isolated.js";
import { Transform } from "./Transform.js";
import { Terminal } from "./Terminal.js";
import { Plugin } from "esbuild";
import { SourceMapConsumer } from "source-map";
import { Context } from "./Context.js";
import { Tsconfig } from "../config/Config.js";

export interface PoolResult {
  error: any;
  report: TestReport | null;
  duration: number;
  logs: LogEntry[];
  sourceMap: SourceMapConsumer;
}

export class Pool {
  private readonly terminal = new Terminal();
  private readonly context = new Context();
  private transformer;
  private reports = new Map<string, PoolResult>();

  constructor(
    private readonly options: {
      testFiles: string[];
      timeout: number;
      plugins: Plugin[];
      context: Record<any, any>;
      tsconfig: Tsconfig;
      requires: string[];
    },
  ) {
    this.transformer = new Transform({
      plugins: options.plugins,
      tsconfig: this.options.tsconfig,
    });
  }

  async run(): Promise<number> {
    const exitCode = 0;
    const startTimes = new Map<string, number>();

    // Initialize terminal with "pending" state for all files
    this.options.testFiles.forEach((file) => {
      this.terminal.set(file, "pending");
    });
    this.terminal.render(); // Initial render

    // Limit the number of concurrent tests for efficiency
    const maxConcurrentTests = 4; // Adjust based on available resources
    const chunks = this.chunkArray(this.options.testFiles, maxConcurrentTests);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (file) => {
          const start = Date.now();
          startTimes.set(file, start);

          try {
            const logger = new Console();

            // Load the test code
            const { code, sourceMap } = await this.transformer.transform(file);

            // Create isolated environment and context
            const isolated = new Isolated({
              file,
              requires: this.options.requires,
            });

            const context = this.context
              .VMContext(file)
              .add({
                console: logger,
              })
              .add(this.options.context)
              .get();

            const script = isolated.script(code);
            const exec = await isolated.exec({
              script,
              context,
              timeout: this.options.timeout,
            });

            const end = Date.now();

            // Update terminal and report results
            const status =
              exec.status && exec.report ? exec.report.status : "failed";

            this.terminal.update(file, status);

            this.reports.set(file, {
              error: exec.error,
              duration: (end - start) / 1000,
              report: exec.report,
              logs: logger.logs,
              sourceMap,
            });
          } catch (error: any) {
            const end = Date.now();
            this.reports.set(file, {
              error,
              duration: (end - start) / 1000,
              report: null,
              logs: [],
              sourceMap: {} as SourceMapConsumer,
            });
            this.terminal.update(file, "failed");
          }
        }),
      );
      this.terminal.render(); // Render after each chunk completes
    }

    return exitCode;
  }

  // Method to get all reports
  getReports(): Map<string, PoolResult> {
    return this.reports;
  }

  // Helper function to split files into chunks
  private chunkArray(array: string[], chunkSize: number): string[][] {
    const results: string[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, i + chunkSize));
    }
    return results;
  }
}
