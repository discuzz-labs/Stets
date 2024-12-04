/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Stats } from "../framework/TestCase.js";
import { TestCaseStatus } from "../framework/TestCase.js";
import kleur from "kleur";
import { LogArgs } from "./Reporter.js";

export class UI {
  static details(stats: Stats): string {
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

  static header({
    description,
    file,
    duration,
    status,
    stats,
  }: LogArgs): string {
    return `\n${this.status(this.stripPath(file!), status as any)} → ${kleur.bold(description)} ${this.details(stats!)} in ${duration}s\n`;
  }

  private static stripPath(path: string) {
    const cwd = process.cwd();

    if (path.startsWith(cwd)) {
      // Remove the current working directory and the following path separator
      return path.slice(cwd.length + 1);
    }
    return path;
  }
}
