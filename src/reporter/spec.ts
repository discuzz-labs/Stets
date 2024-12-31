/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import path from "path";
import { ErrorInspect } from "../core/ErrorInspect.js";
import { PoolResult } from "../core/Pool.js";
import { testReportHeader } from "../utils/ui.js";
import { Reporter } from "./Reporter.js";
import { LogEntry, replayLogs } from "../core/Logger.js";
import { generateReport, summary } from "./lib.js";

export interface spec extends Reporter {}

/**
 * The specification for the specReporter that generates and outputs a test report to the console.
 * 
 * @type {spec}
 */
export const spec: spec = {
  name: "specReporter",
  type: "console",
  report: async function (options: {
    reports: Map<string, PoolResult>;
    outputDir?: string;
  }) {
    let fileLogs: Map<string, LogEntry[]> = new Map();
    const totalStats = {
      total: 0,
      passed: 0,
      failed: 0,
      softfailed: 0,
      skipped: 0,
      todo: 0,
      duration: 0,
    };

    for (const [
      file,
      { logs, error, sourceMap, duration, report },
    ] of options.reports) {
      if (logs.length > 0) fileLogs.set(file, logs);
      const status = report ? report.status : "failed";
      const stats = report?.stats || {
        total: 0,
        passed: 0,
        failed: 0,
        softfailed: 0,
        skipped: 0,
        todo: 0,
      };
      const description = report?.description || path.basename(file);

      process.stdout.write(
        testReportHeader({ description, file, duration, status, stats }),
      );

      if (report) {
        const generatedReport = generateReport({ file, report, sourceMap });
        process.stdout.write(generatedReport);
      }

      if (error) process.stdout.write(ErrorInspect.format({ error, file }));

      // Aggregate stats
      totalStats.total += stats.total;
      totalStats.passed += stats.passed;
      totalStats.failed += stats.failed;
      totalStats.softfailed += stats.softfailed;
      totalStats.skipped += stats.skipped;
      totalStats.todo += stats.todo;
      totalStats.duration += duration;
    }

    replayLogs(fileLogs);

    process.stdout.write(summary(totalStats));
  },
};
