/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Stats, TestReport } from "../framework/TestCase";
import { ErrorMetadata, ErrorParser } from "../utils/ErrorParser";
import kleur from "../utils/kleur";
import path from "path";

interface ReportOptions {
  file: string;
  report: TestReport;
}

interface StartArgs {
  file: string;
}

interface FinishArgs {
  file: string;
  status: "passed" | "failed";
}

interface TestCaseArgs {
  name: string;
  file: string;
  duration: number;
  stats: Stats;
}

interface FailArgs {
  description: string;
  error: ErrorMetadata | undefined;
  file: string;
}

interface SkipArgs {
  description: string;
}

export class Reporter {
  static stats: Stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  static start({ file }: StartArgs): string {
    const dirPath = path.dirname(file);
    const fileName = path.basename(file);

    return (
      kleur.bgYellow(" RUNNING ") +
      " " +
      kleur.gray(dirPath) +
      "/" +
      kleur.white(fileName)
    );
  }

  static finish({ file, status }: FinishArgs): string {
    const dirPath = path.dirname(file);
    const fileName = path.basename(file);

    return (
      (status ? kleur.bgGreen(" PASSED ") : kleur.bgRed(" FAILED ")) +
      " " +
      kleur.gray(dirPath) +
      "/" +
      kleur.white(fileName)
    );
  }

  static testCase({ name, file, duration, stats }: TestCaseArgs): string {
    return (
      (stats.failed > 0
        ? kleur.red(kleur.bold(name))
        : kleur.green(kleur.bold(name))) +
      ` (${stats.total} / ${stats.passed})` +
      " at " +
      kleur.gray(path.dirname(file)) +
      " in " +
      kleur.gray(`${duration} ms`) +
      "\n\n"
    );
  }

  static fail({ file, description, error }: FailArgs): string {
    const errorDetails = ErrorParser.format({
      error,
      filter: file,
      maxLines: 10,
    });
    return (
      kleur.bgRed(kleur.bold(" FAILED ")) +
      " " +
      kleur.bgBlack(kleur.white(description)) +
      "\n" +
      errorDetails +
      "\n"
    );
  }

  static skip({ description }: SkipArgs): string {
    return (
      kleur.bgYellow(kleur.bold(" SKIPPED ")) +
      " " +
      kleur.bgBlack(kleur.white(description)) +
      "\n"
    );
  }

  static pass() {
    this.stats.passed++;
  }

  static report({ file, report }: ReportOptions): string {
    const output = [],
      f = [...report.tests, ...report.hooks];
    f.filter((t) => t.status === "failed").forEach((t) => {
      this.stats.failed++;
      output.push(
        this.fail({ description: t.description, error: t.error, file }),
      );
    });
    f.filter((t) => t.status === "skipped").forEach((t) => {
      this.stats.skipped++;
      output.push(this.skip({ description: t.description }));
    });
    this.stats.total += f.length;
    this.stats.passed += f.length - (this.stats.failed + this.stats.skipped);
    if (!f.length) output.push(`${report.description} is empty!`);
    return output.join("\n");
  }

  static summary(): string {
    const { total, passed, failed, skipped } = this.stats;
    const passedPercentage =
      total > 0 ? ((passed / total) * 100).toFixed(2) : "0.00";
    const failedPercentage =
      total > 0 ? ((failed / total) * 100).toFixed(2) : "0.00";
    const skippedPercentage =
      total > 0 ? ((skipped / total) * 100).toFixed(2) : "0.00";

    return (
      "\n" +
      kleur.white("Total: ") +
      `${total}` +
      "\n" +
      kleur.green("Passed: ") +
      `${passed} (${kleur.bold(passedPercentage)}%)` +
      "\n" +
      kleur.red("Failed: ") +
      `${failed} (${kleur.bold(failedPercentage)}%)` +
      "\n" +
      kleur.yellow("Skipped: ") +
      `${skipped} (${kleur.bold(skippedPercentage)}%)` +
      kleur.gray("\n\n🍾 ⚡️ All Tests ran!")
    );
  }
}
