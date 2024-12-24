/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";
import path from "path";
import { SourceMapConsumer } from "source-map";
import { BenchmarkMetrics } from "../core/Bench.js";
import { ErrorInspect, ErrorMetadata } from "../core/ErrorInspect.js";
import { PoolResult } from "../core/Pool.js";
import { TestCaseStatus, TestReport, Stats } from "../framework/TestCase.js";
import { testReportHeader } from "../utils/ui.js";
import { Reporter } from "./Reporter.js";
import { LogEntry, replayLogs } from "../core/Logger.js";

export interface LogArgs {
  description: string;
  file?: string;
  duration?: number;
  status?: TestCaseStatus;
  stats?: Stats;
  error?: ErrorMetadata;
  retries?: number;
  softFail?: boolean;
  bench?: BenchmarkMetrics | null;
}

export interface ReportOptions {
  file: string;
  report: TestReport;
  sourceMap: SourceMapConsumer;
}

export function log(
  args: LogArgs,
  type: string,
  sourceMap: SourceMapConsumer,
): string {
  const { description, file, error, retries, bench, duration } = args;
  const indicators = {
    failed: kleur.red("×"),
    softfailed: kleur.red("!"),
    skipped: kleur.yellow("-"),
    passed: kleur.green("✓"),
    todo: kleur.blue("□"),
  };

  switch (type) {
    case "failed":
    case "softfailed":
      const errorDetails = ErrorInspect.format({
        error: error as any,
        file,
        sourceMap,
      });
      return `${indicators[type]} ${description} in ${duration}ms ${kleur.gray(
        `retries: ${retries}`,
      )}\n${errorDetails}`;

    default:
      const benchFormated = bench ? benchFormat(bench) : "";
      return `${(indicators as any)[type] || "-"} ${description} in ${duration}ms${benchFormated}`;
  }
}

export function benchFormat(data: BenchmarkMetrics): string {
  const format = (num: number) => num.toFixed(8);
  const formatOps = (num: number) => num.toLocaleString();

  // Highlighting functions
  const title = (text: string) => kleur.bold(text);
  const label = (text: string) => kleur.bold(text);
  const value = (text: string) => kleur.cyan(text);
  const status = (text: string) => kleur.red(text);

  const divider = kleur.dim("─────────────────────────────────────────────");

  const lines = [
    " ",
    " ",
    title("Benchmark Results"),
    divider,
    `${label("Throughput")}: ${value(formatOps(data.opsPerSecond))} ops/s`,
    "",
    `${label("Latency")}:`,
    `  ${label("Mean")}: ${value(format(data.meanLatency))}ms`,
    `  ${label("p50")}:  ${value(format(data.medianLatency))}ms`,
    `  ${label("p95")}:  ${value(format(data.p95Latency))}ms`,
    `  ${label("Std Dev")}: ±${value(format(data.stdDev))}ms`,
    "",
    `${label("Confidence Interval")}: (${value(data.confidenceInterval.lower.toFixed(2))} - ${value(data.confidenceInterval.upper.toFixed(2))}ms)`,
    `${label("Samples")}: ${value(data.samples.toLocaleString())}`,
    "",
    data.timedOut ? `${status("Status: Timed out")}` : "",
    " ",
  ]
    .filter(Boolean) // Remove empty lines
    .map((line) => "  " + line)
    .join("\n");

  return lines;
}

export function generate({ file, report, sourceMap }: ReportOptions): string {
  const items = [...report.tests, ...report.hooks];
  if (items.length === 0) {
    return `${report.description} is empty`;
  }

  const output = items.map((test) => {
    const logEntry = log(
      {
        description: test.description,
        error: test.error,
        file,
        retries: test.retries,
        softFail: test.status === "softfailed",
        duration: test.duration,
        bench: test.bench,
      },
      test.status,
      sourceMap,
    );

    return logEntry;
  });

  return (
    output
      .filter(Boolean)
      .map((line) => "  " + line)
      .join("\n") + "\n"
  );
}

function summary(stats: {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  softfailed: number;
  todo: number;
  duration: number;
}): string {
  const { total, passed, failed, skipped, softfailed, duration } = stats;
  const percent = (count: number) =>
    total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

  const parts = [
    `Total: ${total} in ${duration.toFixed(2)}s`,
    passed && kleur.green(`✓ ${passed} (${percent(passed)}%)`),
    failed && kleur.red(`× ${failed} (${percent(failed)}%)`),
    softfailed && kleur.red(`! ${softfailed} (${percent(softfailed)}%)`),
    skipped && kleur.yellow(`- ${skipped} (${percent(skipped)}%)`),
  ];

  return `\n${parts.filter(Boolean).join("\n")}\n\n✨ All Tests ran. ✨\n`;
}

export interface spec extends Reporter {}

export const spec: spec = {
  name: "consoleReporter",
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
        const generatedReport = generate({ file, report, sourceMap });
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
