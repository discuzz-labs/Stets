/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Stats, TestCaseStatus, TestReport } from "../framework/TestCase.js";
import { ErrorMetadata, ErrorInspect } from "../core/ErrorInspect.js";
import kleur from "../utils/kleur.js";
import path from "path";
import { BenchmarkMetrics } from "../core/Bench.js";
import { Generate, GenerateOptions } from "./Generate.js";
import { SourceMapConsumer } from "source-map";
import { stripPath } from "../utils/index.js";

interface ReportOptions {
  file: string;
  report: TestReport;
  sourceMap: SourceMapConsumer
}

interface LogArgs {
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

export class Reporter {
  static stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    softfailed: 0,
    todo: 0,
  };
  static reportsGenerated = 0;

  static generateConfig: GenerateOptions;

  constructor(generateConfig: GenerateOptions) {
    Reporter.generateConfig = generateConfig;
  }

  private static details(stats: Stats): string {
    const items = [
      stats.failed && kleur.red(`× ${stats.failed}`),
      stats.skipped && kleur.yellow(`- ${stats.skipped}`),
      stats.passed && kleur.green(`✓ ${stats.passed}`),
      stats.total && kleur.gray(`*: ${stats.total}`),
    ];
    return items.filter(Boolean).join(" ") || "Empty";
  }

  static status(name: string, status: TestCaseStatus): string {
    const statusColors = {
      pending: kleur.yellow("⋯"),
      empty: kleur.gray("-"),
      failed: kleur.red("×"),
      passed: kleur.green("✓"),
    };
    return `${statusColors[status] || "-"} ${name}`;
  }

  private static log(args: LogArgs, type: string, sourceMap: SourceMapConsumer): string {
    const { description, file, error, retries, bench } = args;
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
        const errorDetails = ErrorInspect.format({ error, file, sourceMap });
        return `${indicators[type]} ${description} ${kleur.gray(`retry: ${retries}`)}\n${errorDetails}`;

      case "benched":
        return `${indicators[type]} ${description}\n${BenchMarks([bench])}`;

      default:
        return `${(indicators as any)[type] || "-"} ${description}`;
    }
  }

  static header({ description, file, duration, status, stats }: LogArgs): string {
    return `\n${this.status(stripPath(file!), status as any)} → ${kleur.bold(description)} ${this.details(stats!)} in ${duration}s\n`;
  }

  static report({ file, report, sourceMap }: ReportOptions): string {
    const items = [...report.tests, ...report.hooks];
    if (items.length === 0) {
      return `${report.description} is empty`;
    }

    const output = items.map((test) => {
      const logEntry = this.log(
        {
          description: test.description,
          error: test.error,
          file,
          retries: test.retries,
          softFail: test.status === "softfailed",
          bench: test.bench,
        },
        test.status,
        sourceMap
      );

      test.status === "benched"
        ? this.stats.passed++
        : this.stats[test.status]++;
      return logEntry;
    });

    if (
      this.generateConfig.outputDir &&
      this.generateConfig.outputDir.length > 0
    ) {
      this.reportsGenerated += new Generate(
        report,
        this.generateConfig,
      ).writeReports();
    }
    this.stats.total += report.stats.total;

    return output.filter(Boolean).join("\n") + "\n"
  }

  static summary(): string {
    const { total, passed, failed, skipped, softfailed } = this.stats;
    const percent = (count: number) =>
      total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

    const parts = [
      `Total: ${total}`,
      passed && kleur.green(`✓ ${passed} (${percent(passed)}%)`),
      failed && kleur.red(`× ${failed} (${percent(failed)}%)`),
      softfailed && kleur.lightRed(`! ${softfailed} (${percent(softfailed)}%)`),
      skipped && kleur.yellow(`- ${skipped} (${percent(skipped)}%)`),
    ];

    return `\n${parts.filter(Boolean).join("\n")}\n\n✨ All Tests ran. ✨\n`;
  }
}

function BenchMarks(data: (BenchmarkMetrics | null | undefined)[]): string | void {
  if (!Array.isArray(data) || data.length === 0) return;

  return data
    .map(item => 
      item 
        ? `✓ [${kleur.bold("TP")}: ${item.throughputMedian?.toFixed(2)} | ${kleur.bold("Lat")}: ${item.latencyMedian?.toFixed(2)} | ${kleur.bold("Samples")}: ${item.samples}]`
        : '× [N/A]'
    )
    .join('\n');
}