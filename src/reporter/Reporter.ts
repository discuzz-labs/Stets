/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Stats, TestCaseStatus, TestReport } from '../framework/TestCase.js';
import { ErrorMetadata, ErrorInspect } from '../core/ErrorInspect.js';
import { BenchmarkMetrics } from '../core/Bench.js';
import { SourceMapConsumer } from 'source-map';
import { PoolResult } from '../core/Pool.js';
import { replay } from '../core/Console.js';
import path from 'path';
import kleur from 'kleur';
import { UI } from './UI.js';

interface ReportOptions {
  file: string;
  report: TestReport;
  sourceMap: SourceMapConsumer;
}

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

export class Reporter {
  private stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    softfailed: 0,
    todo: 0,
  };

  private log(
    args: LogArgs,
    type: string,
    sourceMap: SourceMapConsumer,
  ): string {
    const { description, file, error, retries, bench } = args;
    const indicators = {
      failed: kleur.red('×'),
      softfailed: kleur.red('!'),
      skipped: kleur.yellow('-'),
      passed: kleur.green('✓'),
      todo: kleur.blue('□'),
      benched: kleur.cyan('⚡'),
    };

    switch (type) {
      case 'failed':
      case 'softfailed':
        const errorDetails = ErrorInspect.format({ error, file, sourceMap });
        return `${indicators[type]} ${description} ${kleur.gray(`retry: ${retries}`)}\n${errorDetails}`;

      case 'benched':
        return `${indicators[type]} ${description}\n${this.benchMarks([bench])}`;

      default:
        return `${(indicators as any)[type] || '-'} ${description}`;
    }
  }

  private generate({ file, report, sourceMap }: ReportOptions): string {
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
          softFail: test.status === 'softfailed',
          bench: test.bench,
        },
        test.status,
        sourceMap,
      );

      if (test.status === 'benched') {
        this.stats.passed++;
      } else {
        this.stats[test.status]++;
      }

      return logEntry;
    });

    this.stats.total += report.stats.total;

    return (
      output
        .filter(Boolean)
        .map((line) => '  ' + line)
        .join('\n') + '\n'
    );
  }

  private summary(): string {
    const { total, passed, failed, skipped, softfailed } = this.stats;
    const percent = (count: number) =>
      total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

    const parts = [
      `Total: ${total}`,
      passed && kleur.green(`✓ ${passed} (${percent(passed)}%)`),
      failed && kleur.red(`× ${failed} (${percent(failed)}%)`),
      softfailed && kleur.red(`! ${softfailed} (${percent(softfailed)}%)`),
      skipped && kleur.yellow(`- ${skipped} (${percent(skipped)}%)`),
    ];

    return `\n${parts.filter(Boolean).join('\n')}\n\n✨ All Tests ran. ✨\n`;
  }

  private benchMarks(
    data: (BenchmarkMetrics | null | undefined)[],
  ): string | void {
    if (!Array.isArray(data) || data.length === 0) return;

    return data
      .map((item) =>
        item
          ? `✓ [${kleur.bold('TP')}: ${item.throughputMedian?.toFixed(2)} | ${kleur.bold('Lat')}: ${item.latencyMedian?.toFixed(2)} | ${kleur.bold('Samples')}: ${item.samples}]`
          : '× [N/A]',
      )
      .join('\n');
  }

  report(reports: Map<string, PoolResult>) {
    for (const [
      file,
      { logs, error, sourceMap, duration, report },
    ] of reports) {
      const status = report ? report.status : 'failed';
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
        UI.header({ description, file, duration, status, stats }),
      );

      if (report) {
        process.stdout.write(this.generate({ file, report, sourceMap }));
      }

      if (error) process.stdout.write(ErrorInspect.format({ error, file }));

      replay(logs);
    }

    process.stdout.write(this.summary());
  }
}
