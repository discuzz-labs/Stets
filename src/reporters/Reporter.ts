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

interface ReportOptions {
  file: string;
  report: TestReport;
}

interface DraftArgs {
  file: string;
  status: TestCaseStatus;
}

interface TestCaseArgs {
  description: string;
  file: string;
  duration: number;
  status: TestCaseStatus;
  stats: Stats;
}

interface FailArgs {
  description: string;
  error: ErrorMetadata | undefined;
  file: string;
  retries: number;
  softFail: boolean;
}

interface SkipArgs {
  description: string;
}

interface BenchArgs {
  description: string;
}

interface TodoArgs {
  description: string;
}

export class Reporter {
  static stats: Stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    softFailed: 0,
    todo: 0,
  };

  private static details(stats: Stats): string {
    let statusText = "";
    if (stats.failed > 0) {
      statusText += kleur.red(" 🔴" + stats.failed);
    }
    if (stats.skipped > 0) {
      statusText += kleur.yellow(" 🟡" + stats.skipped);
    }
    if (stats.passed > 0) {
      statusText += kleur.green(" 🟢" + stats.passed);
    }
    if (stats.softFailed > 0) {
      statusText += kleur.lightRed(" 🟠" + stats.softFailed);
    }
    if (stats.todo > 0) {
      statusText += kleur.purple(" ✏️ " + stats.todo);
    }
    if (statusText === "") {
      statusText = " Empty ";
    }
    if (stats.total > 0) {
      statusText += kleur.gray(" 🔢" + stats.total);
    }
    return statusText;
  }

  private static status(name: string, status: TestCaseStatus): string {
    switch (status) {
      case "pending":
        return kleur.bgYellow(" RUNNING ");
      case "empty":
        return kleur.bgGray(name);
      case "failed":
        return kleur.bgRed(name);
      case "passed":
        return kleur.bgGreen(name);
    }
  }

  private static fail({
    file,
    description,
    error,
    retries,
    softFail,
  }: FailArgs): string {
    const errorDetails = ErrorInspect.format({
      error,
      file,
      maxLines: 10,
    });
    return (
      (softFail
        ? kleur.bgLightRed(kleur.bold(" SOFT FAIL "))
        : kleur.bgRed(kleur.bold(" FAILED "))) +
      " " +
      kleur.bgBlack(kleur.white(description)) +
      " " +
      kleur.gray("retries: " + retries) +
      "\n" +
      errorDetails +
      "\n"
    );
  }

  private static skip({ description }: SkipArgs): string {
    return (
      kleur.bgYellow(kleur.bold(" SKIPPED ")) +
      " " +
      kleur.bgBlack(kleur.white(description))
    );
  }

  private static bench({ description }: BenchArgs): string {
    return (
      kleur.bgBlue(kleur.bold(" BENCHED ")) +
      " " +
      kleur.bgBlack(kleur.white(description)) +
      "\n"
    );
  }

  private static todo({ description }: TodoArgs): string {
    return (
      kleur.bgPurple(kleur.bold(" TODO ")) +
      " " +
      kleur.bgBlack(kleur.white(description))
    );
  }

  private static pass({ description }: TodoArgs): string {
    return (
      kleur.bgGreen(kleur.bold(" PASSED ")) +
      " " +
      kleur.bgBlack(kleur.white(description))
    );
  }

  static draft({ file, status }: DraftArgs): string {
    const dirPath = path.dirname(file);
    const fileName = path.basename(file);

    return (
      this.status(fileName, status) +
      " " +
      kleur.gray(dirPath) +
      "/" +
      kleur.white(fileName)
    );
  }

  static header({
    description,
    file,
    duration,
    status,
    stats,
  }: TestCaseArgs): string {
    return (
      "\n\n" +
      this.status(description, status) +
      " (" +
      this.details(stats) +
      ") " +
      " at " +
      kleur.gray(path.dirname(file)) +
      " in " +
      kleur.gray(`${duration} s`) +
      "\n\n"
    );
  }

  static report({ file, report }: ReportOptions) {
    const output = [];
    const items = [...report.tests, ...report.hooks];

    items.forEach((t) => {
      switch (t.status) {
        case "failed":
          this.stats.failed++;
          output.push(
            this.fail({
              description: t.description,
              error: t.error,
              file,
              retries: t.retries,
              softFail: false,
            }),
          );
          break;
        case "skipped":
          this.stats.skipped++;
          output.push(this.skip({ description: t.description }));
          break;
        case "soft-failed":
          this.stats.softFailed++;
          output.push(
            this.fail({
              description: t.description,
              error: t.error,
              file,
              retries: t.retries,
              softFail: true,
            }),
          );
          break;
        case "todo":
          this.stats.todo++;
          output.push(
            this.todo({
              description: t.description,
            }),
          );
          break;
        case "passed":
          this.stats.passed++;
          output.push(this.pass({ description: t.description }));
      }
    });

    report.benchMarks.forEach((bench) => {
      if (!bench) return;
      output.push(this.bench({ description: bench["Task name"] as string }));
      output.push(Table([bench], Object.keys(bench).slice(-5)));
    });

    this.stats.total += report.stats.total;
    if (items.length === 0) output.push(`${report.description} is empty!`);
    return output.join("\n");
  }

  static summary(): string {
    const { total, passed, failed, skipped, softFailed, todo } = this.stats;
    const passedPercentage =
      total > 0 ? ((passed / total) * 100).toFixed(2) : "0.00";
    const failedPercentage =
      total > 0 ? ((failed / total) * 100).toFixed(2) : "0.00";
    const skippedPercentage =
      total > 0 ? ((skipped / total) * 100).toFixed(2) : "0.00";
    const softFailedPercentage =
      total > 0 ? ((softFailed / total) * 100).toFixed(2) : "0.00";
    const todoPercentage =
      total > 0 ? ((todo / total) * 100).toFixed(2) : "0.00";

    return (
      "\n\n" +
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
      "\n" +
      kleur.lightRed("Soft failed: ") +
      `${softFailed} (${kleur.bold(softFailedPercentage)}%)` +
      "\n" +
      kleur.purple("Todo: ") +
      `${todo} (${kleur.bold(todoPercentage)}%)` +
      "\n\n" +
      kleur.gray("🍾 ⚡️ All Tests ran!") +
      "\n\n"
    );
  }
}
