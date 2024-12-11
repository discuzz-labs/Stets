/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as vm from "vm";
import { TestReport } from "../framework/TestCase.js";

export interface ExecResult {
  status: boolean;
  error: Error | null;
  report: TestReport | null;
}

interface ExecOptions {
  script: vm.Script;
  context: vm.Context;
  timeout: number;
}

export class Isolated {
  constructor(
    private readonly options: {
      file: string;
      requires: string[];
    },
  ) {}

  injectRequires(code: string) {
    const requireStack = [];
    for (const require of this.options.requires) {
      requireStack.push(`require("${require}")`);
    }
    requireStack.push(code);
    return requireStack.join("\n");
  }

  script(code: string) {
    return new vm.Script(this.injectRequires(code), {
      filename: this.options.file,
    });
  }

  async exec({ script, context, timeout }: ExecOptions): Promise<ExecResult> {
    try {
      const report = await script.runInNewContext(context, {
        timeout,
        displayErrors: true,
      });

      const isValid = this.isValidReport(report);

      return {
        status: isValid,
        error: null,
        report: isValid ? report : null,
      };
    } catch (error: any) {
      return {
        status: false,
        error,
        report: null,
      };
    }
  }

  isValidReport(report: any): report is TestReport {
    return (
      report !== null &&
      typeof report === "object" &&
      typeof report.status === "string" &&
      typeof report.stats === "object" &&
      report.stats !== null &&
      typeof report.stats.total === "number" &&
      typeof report.stats.passed === "number" &&
      typeof report.stats.failed === "number" &&
      typeof report.stats.skipped === "number" &&
      Array.isArray(report.tests) &&
      Array.isArray(report.hooks)
    );
  }
}
