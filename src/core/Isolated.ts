/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { createRequire } from "module";
import * as vm from "vm";
import TestCase, { TestReport } from "../framework/TestCase.js";
import path from "path";

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
  constructor(private readonly filename: string) {}

  context(context: any = {}): vm.Context {
    const testCase = new TestCase("Unnamed test");

    return vm.createContext({
      ...context,
      it: testCase.it.bind(testCase),
      fail: testCase.fail.bind(testCase),
      sequence: testCase.sequence.bind(testCase),
      timeout: testCase.timeout.bind(testCase),
      todo: testCase.todo.bind(testCase),
      retry: testCase.retry.bind(testCase),
      itIf: testCase.itIf.bind(testCase),
      should: testCase.should.bind(testCase),
      only: testCase.only.bind(testCase),
      skip: testCase.skip.bind(testCase),
      each: testCase.each.bind(testCase),
      beforeEach: testCase.beforeEach.bind(testCase),
      beforeAll: testCase.beforeAll.bind(testCase),
      run: testCase.run.bind(testCase),

      require: createRequire(this.filename),
      __filename: path.basename(this.filename),
      __dirname: path.dirname(this.filename),
    });
  }

  script(code: string) {
    return new vm.Script(code, {
      filename: this.filename,
    });
  }

  async exec({ script, context, timeout }: ExecOptions): Promise<ExecResult> {
    try {
      const report = await script.runInNewContext(context, {
        timeout,
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
