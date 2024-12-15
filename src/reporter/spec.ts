/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";
import path from "path";
import { SourceMapConsumer } from "source-map";
import { BenchmarkMetrics } from "../core/Bench.js";
import { replay } from "../core/Console.js";
import { ErrorInspect, ErrorMetadata } from "../core/ErrorInspect.js";
import { PoolResult } from "../core/Pool.js";
import { TestCaseStatus, TestReport, Stats } from "../framework/TestCase.js";
import { testReportHeader } from "../utils/ui.js";
import { Reporter } from "./Reporter.js";

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
    benched: kleur.cyan("⚡"),
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
        `retry: ${retries}`,
      )}\n${errorDetails}`;

    case "benched":
      return `${indicators[type]} ${description} in ${duration}ms\n${benchMarks([bench])}`;

    default:
      return `${(indicators as any)[type] || "-"} ${description} in ${duration}ms`;
  }
}

export function benchMarks(
  data: (BenchmarkMetrics | null | undefined)[],
): string | void {
  if (!Array.isArray(data) || data.length === 0) return;

  return data
    .map((item) =>
      item
        ? `✓ [${kleur.bold("TP")}: ${item.throughputMedian?.toFixed(2)} | ${kleur.bold(
            "Lat",
          )}: ${item.latencyMedian?.toFixed(2)} | ${kleur.bold(
            "Samples",
          )}: ${item.samples}]`
        : "× [N/A]",
    )
    .join("\n");
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
    `Total: ${total} in ${duration}s`,
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

      replay(logs);

      // Aggregate stats
      totalStats.total += stats.total;
      totalStats.passed += stats.passed;
      totalStats.failed += stats.failed;
      totalStats.softfailed += stats.softfailed;
      totalStats.skipped += stats.skipped;
      totalStats.todo += stats.todo;
      totalStats.duration += duration;
    }

    process.stdout.write(summary(totalStats));
  },
};
