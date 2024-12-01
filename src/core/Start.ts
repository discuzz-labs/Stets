/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import Watcher from "watcher";
import { Pool, PoolResult } from "./Pool.js";
import { Config } from "../config/Config.js";

export class Start {
  private reports: Map<string, PoolResult> = new Map();

  constructor(
    private readonly options: {
      watch: boolean;
      config: Config;
      files: string[];
    },
  ) {}

  async exec(files: string[]) {
    const pool = new Pool({
      testFiles: files,
      context: this.options.config.get("context"),
      plugins: this.options.config.get("plugins"),
      tsconfig: this.options.config.get("tsconfig"),
      timeout: parseInt(
        this.options.config.get("timeout") as unknown as string,
      ),
    });
    const exitCode = await pool.run();
    return {
      exitCode,
      reports: pool.getReports(),
    };
  }

  async start() {
    if (this.options.watch) {
      // Run initial tests
      const { reports } = await this.exec(this.options.files);
      this.reports = reports;
      Pool.report(this.reports);

      // Setup and start watching
      this.watch();

      // Keep the process running
      await new Promise(() => {});
    } else {
      const { exitCode, reports } = await this.exec(this.options.files);
      Pool.report(reports);
      process.exit(exitCode);
    }
  }

  add(file: string, report: PoolResult) {
    this.reports.set(file, report);
  }

  change(file: string, report: PoolResult) {
    this.reports.set(file, report);
  }

  watch() {
    const watcher = new Watcher(this.options.files, {
      recursive: true,
      ignoreInitial: true
    });

    watcher.on("change", async (file: string) => {
      console.clear();

      try {
        const { reports } = await this.exec([file]);
        const fileReport = reports.get(file) as PoolResult;

        if (fileReport) {
          this.change(file, fileReport);
          Pool.report(this.reports);
        }
      } catch (error) {
        console.error(`Error processing changed file ${file}:`, error);
      }
    });

    // Optional: Handle other file system events
    watcher.on("add", async (file: string) => {
      if (this.isTestFile(file)) {
        try {
          const { reports } = await this.exec([file]);
          const fileReport = reports.get(file) as PoolResult;

          if (fileReport) {
            this.add(file, fileReport);
            Pool.report(this.reports);
          }
        } catch (error) {
          console.error(`Error processing new file ${file}:`, error);
        }
      }
    });

    watcher.on("unlink", (file: string) => {
      console.clear()
      if (this.reports.has(file)) {
        this.reports.delete(file);
        Pool.report(this.reports);
      }
    });
  }

  private isTestFile(file: string): boolean {
    return true
  }
}