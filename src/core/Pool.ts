/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Logger, LogEntry } from "./Logger.js";
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
    let exitCode = 0;

    // Initialize terminal with "pending" state for all files
    this.options.testFiles.forEach((file) => {
      this.terminal.set(file, "pending");
    });
    this.terminal.render(); // Initial render

    const maxConcurrentTests = 4;
    const chunks = this.chunkArray(this.options.testFiles, maxConcurrentTests);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (file) => {
          const start = Date.now();
          const logger = new Logger(); // File-specific logger
          const context = new Context()
            .VMContext(file)
            .add({ console: logger })
            .add(this.options.context)
            .get();

          try {
            const { code, sourceMap } = await this.transformer.transform(file);

            const isolated = new Isolated({
              file,
              requires: this.options.requires,
            });

            const script = isolated.script(code);
            const exec = await isolated.exec({
              script,
              context,
              timeout: this.options.timeout,
            });

            // Update exitCode
            if(exec.error || exec.report?.status === "failed") {
              exitCode = 1
            }

            const end = Date.now();
            const status = exec.report ? exec.report.status : "failed";

            // Update terminal and assign logs to the correct file
            this.terminal.update(file, status);
            this.reports.set(file, {
              error: exec.error,
              duration: (end - start) / 1000,
              report: exec.report,
              logs: logger.logs, // Scoped logs
              sourceMap,
            });
          } catch (error) {
            // Update exitCode
            exitCode = 1
            
            const end = Date.now();
            this.reports.set(file, {
              error,
              duration: (end - start) / 1000,
              report: null,
              logs: logger.logs, // Ensure logs are still captured
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
