/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Stats, TestCaseStatus, TestReport } from "../framework/TestCase.js";
import { ErrorMetadata, ErrorInspect } from "../core/ErrorInspect.js";
import kleur from "../utils/kleur.js";
import path from "path";
import { Table } from "../utils/Table.js";
import { BenchmarkMetrics } from "../core/Bench.js";

interface ReportOptions {
  file: string;
  report: TestReport;
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
  bench?: BenchmarkMetrics | null
}

export class Reporter {
  static stats: Stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    softfailed: 0,
    todo: 0,
  };

  static config: Set<string>;

  constructor(config: string[]) {
    Reporter.config = new Set(config.map((level) => level.toLowerCase()));
  }

  private static details(stats: Stats): string {
    const elements = [
      stats.failed > 0 && kleur.red(`🔴 ${stats.failed}`),
      stats.skipped > 0 && kleur.yellow(`🟡 ${stats.skipped}`),
      stats.passed > 0 && kleur.green(`🟢 ${stats.passed}`),
      stats.softfailed > 0 && kleur.lightRed(`🟠 ${stats.softfailed}`),
      stats.todo > 0 && kleur.purple(`✏️ ${stats.todo}`),
      stats.total > 0 && kleur.gray(`🔢 ${stats.total}`),
    ];
    return elements.filter(Boolean).join(" ") || "Empty";
  }

  static status(name: string, status: TestCaseStatus): string {
    const statusMap = {
      pending: kleur.bgYellow(" RUNNING "),
      empty: kleur.bgGray(name),
      failed: kleur.bgRed(name),
      passed: kleur.bgGreen(name),
    };
    return statusMap[status] || kleur.bgBlack(name);
  }

  private static log(args: LogArgs, type: string): string {
    const { description, file, error, retries } = args;
    const labelMap = {
      failed: kleur.bgRed(kleur.bold(" FAILED ")),
      softfailed: kleur.bgLightRed(kleur.bold(" SOFT FAIL ")),
      skipped: kleur.bgYellow(kleur.bold(" SKIPPED ")),
      passed: kleur.bgGreen(kleur.bold(" PASSED ")),
      todo: kleur.bgPurple(kleur.bold(" TODO ")),
      benched: kleur.bgBlue(kleur.bold(" BENCHED ")),
    };

    if (!Reporter.config.has(type.toLowerCase()) && !Reporter.config.has("all"))
      return "";

    switch (type) {
      case "failed":
      case "softfailed":
        const errorDetails = ErrorInspect.format({
          error,
          file,
          maxLines: 10,
        });
        return `${labelMap[type]} ${kleur.bgBlack(
          kleur.white(description),
        )} ${kleur.gray(`retries: ${retries}`)}\n${errorDetails}\n`;
      case "skipped":
      case "todo":
      case "passed":
        return `${labelMap[type]} ${kleur.bgBlack(kleur.white(description))}`;
      case "benched":
        return `${labelMap[type]} ${kleur.bgBlack(kleur.white(description))}\n\n${Table([args.bench])}`;
    }
    return "";
  }

  static header({ description, file, duration, stats }: LogArgs): string {
    return (
      `\n\n${kleur.bold(description)} (${this.details(stats!)}) ` +
      `at ${kleur.gray(path.dirname(file!))} in ${kleur.gray(`${duration} s`)}\n\n`
    );
  }

  static report({ file, report }: ReportOptions): string {
    const output: string[] = [];
    const items = [...report.tests, ...report.hooks];

    items.forEach((t) => {
      output.push(
        this.log(
          {
            description: t.description,
            error: t.error,
            file,
            retries: t.retries,
            softFail: t.status === "softfailed",
            bench: t.bench
          },
          t.status,
        ),
      );

      t.status === "benched" ? this.stats.passed++ : this.stats[t.status]++;
    });

    this.stats.total += report.stats.total;
    if (items.length === 0) output.push(`${report.description} is empty!`);
    return output.filter(Boolean).join("\n");
  }

  static summary(): string {
    const { total, passed, failed, skipped, softfailed, todo } = this.stats;
    const calcPercent = (count: number) =>
      total > 0 ? ((count / total) * 100).toFixed(2) : "0.00";

    return (
      `\n\n${kleur.white("Total: ")}${total}\n` +
      `${kleur.green("Passed: ")}${passed} (${kleur.bold(calcPercent(passed))}%)\n` +
      `${kleur.red("Failed: ")}${failed} (${kleur.bold(calcPercent(failed))}%)\n` +
      `${kleur.yellow("Skipped: ")}${skipped} (${kleur.bold(calcPercent(skipped))}%)\n` +
      `${kleur.lightRed("Soft failed: ")}${softfailed} (${kleur.bold(
        calcPercent(softfailed),
      )}%)\n` +
      `${kleur.purple("Todo: ")}${todo} (${kleur.bold(calcPercent(todo))}%)\n\n` +
      kleur.gray("🍾 ⚡️ All Tests ran!") +
      "\n\n"
    );
  }
}
