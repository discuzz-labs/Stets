/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Stats, TestCaseStatus, TestReport } from "../framework/TestCase.js";
import { ErrorMetadata, ErrorParser } from "../utils/ErrorParser.js";
import kleur from "../utils/kleur.js";
import path from "path";

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

export class Reporter {
  static stats: Stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    softFailed: 0,
  };

  private static details(stats: Stats): string {
    let statusText = "";
    switch (true) {
      case stats.failed > 0:
        statusText += kleur.red(" 🔴 " + stats.failed);
        break;
      case stats.skipped > 0:
        statusText += kleur.yellow(" 🟡 " + stats.skipped);
        break;
      case stats.passed > 0:
        statusText += kleur.green(" 🟢 " + stats.passed);
        break;
      case stats.softFailed > 0:
        statusText += kleur.lightRed(" 🟠 " + stats.softFailed);
        break;
      default:
        statusText = " Empty ";
        break;
    }
    if (stats.total > 0) {
      statusText += kleur.gray(" 🔢 " + stats.total);
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
      default:
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
    const errorDetails = ErrorParser.format({
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
      kleur.bgBlack(kleur.white(description)) +
      "\n"
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
        default:
          this.stats.passed++;
      }
    });

    this.stats.total += report.stats.total;
    if (items.length === 0) output.push(`${report.description} is empty!`);
    return output.join("\n");
  }

  static summary(): string {
    const { total, passed, failed, skipped, softFailed } = this.stats;
    const passedPercentage =
      total > 0 ? ((passed / total) * 100).toFixed(2) : "0.00";
    const failedPercentage =
      total > 0 ? ((failed / total) * 100).toFixed(2) : "0.00";
    const skippedPercentage =
      total > 0 ? ((skipped / total) * 100).toFixed(2) : "0.00";
    const softFailedPercentage =
      total > 0 ? ((softFailed / total) * 100).toFixed(2) : "0.00";

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
      "\n" +
      kleur.lightRed("Soft failed: ") +
      `${softFailed} (${kleur.bold(softFailedPercentage)}%)` +
      "\n" +
      kleur.gray("\n🍾 ⚡️ All Tests ran!") +
      "\n"
    );
  }
}
