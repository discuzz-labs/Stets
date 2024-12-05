/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import Watcher from 'watcher';
import { Pool, PoolResult } from './Pool.js';
import { Config } from '../config/Config.js';
import { Reporter } from '../reporter/Reporter.js';
import { isValidFile } from '../glob/Glob.js';

export class Start {
  private reports: Map<string, PoolResult> = new Map();

  constructor(
    private readonly options: {
      watch: boolean;
      config: Config;
      files: string[];
      pattern: string[];
      exclude: string[];
      requires: string[];
    },
  ) {}

  async exec(files: string[]) {
    const pool = new Pool({
      testFiles: files,
      context: this.options.config.get('context'),
      plugins: this.options.config.get('plugins'),
      tsconfig: this.options.config.get('tsconfig'),
      timeout: parseInt(
        this.options.config.get('timeout') as unknown as string,
      ),
      requires: this.options.requires
    });
    const exitCode = await pool.run();
    return {
      exitCode,
      reports: pool.getReports(),
    };
  }

  async start() {
    const reporter = new Reporter();
    if (this.options.watch) {
      // Run initial tests
      const { reports } = await this.exec(this.options.files);
      this.reports = reports;
      reporter.report(this.reports);

      // Setup and start watching
      this.watch();
    } else {
      const { exitCode, reports } = await this.exec(this.options.files);
      reporter.report(reports);
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
      ignoreInitial: true,
    });

    watcher.on('change', async (file: string) => {
      const reporter = new Reporter();
      console.clear();

      try {
        const { reports } = await this.exec([file]);
        const fileReport = reports.get(file) as PoolResult;

        if (fileReport) {
          this.change(file, fileReport);
          reporter.report(this.reports);
        }
      } catch (error) {
        console.error(`Error processing changed file ${file}:`, error);
      }
    });

    // Optional: Handle other file system events
    watcher.on('add', async (file: string) => {
      const reporter = new Reporter();
      if (isValidFile(file, this.options.pattern, this.options.exclude)) {
        console.clear();
        try {
          const { reports } = await this.exec([file]);
          const fileReport = reports.get(file) as PoolResult;

          if (fileReport) {
            this.add(file, fileReport);
            reporter.report(this.reports);
          }
        } catch (error) {
          console.error(`Error processing new file ${file}:`, error);
        }
      }
    });

    watcher.on('unlink', (file: string) => {
      const reporter = new Reporter();
      console.clear();
      if (this.reports.has(file)) {
        this.reports.delete(file);
        reporter.report(this.reports);
      }
    });

    watcher.on('error', (error: Error) => {
      console.error(`Error occured while watching:`, error);
    });
  }
}
