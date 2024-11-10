/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { createRequire } from "module";
import * as vm from "vm";
import * as path from "path";
import TestCase, { TestReport } from "../framework/TestCase";

interface ExecResult {
  status: boolean;
  error: Error | null;
  report: TestReport | null;
}

interface ExecOptions {
  script: vm.Script;
  context: vm.Context;
}

export class Isolated {
  constructor(private readonly filename: string) {}

  context(context: any = {}): vm.Context {
    const testCase = new TestCase();

    const globals = {
      it: testCase.it.bind(testCase),
      only: testCase.only.bind(testCase),
      skip: testCase.skip.bind(testCase),
      each: testCase.each.bind(testCase),
      beforeEach: testCase.beforeEach.bind(testCase),
      beforeAll: testCase.beforeAll.bind(testCase),
      run: testCase.run.bind(testCase),

      require: createRequire(this.filename),
      exports: {},
      __filename: this.filename,
      __dirname: path.dirname(this.filename),
      ...context,
    };
    return vm.createContext(globals);
  }

  script(code: string) {
    return new vm.Script(code, {
      filename: this.filename,
    });
  }

  async exec({ script, context }: ExecOptions): Promise<ExecResult> {
    try {
      const report = await script.runInNewContext(context);
      const isValid = this.isValidReport(report)
      
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
      typeof report.passed === "boolean" &&
      typeof report.stats === "object" &&
      report.stats !== null &&
      typeof report.stats.total === "number" &&
      typeof report.stats.passed === "number" &&
      typeof report.stats.failures === "number" &&
      Array.isArray(report.tests) &&
      Array.isArray(report.hooks)
    )
  }
}
