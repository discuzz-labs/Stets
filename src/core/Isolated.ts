/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */


import { Console } from './Console';
import { createRequire } from 'module';
import * as vm from 'vm';
import * as path from 'path';
import Suite, { SuiteReport } from '../framework/Suite';

interface ExecResult {
  status: boolean;
  error: Error | null;
  report: SuiteReport | null;
}

interface ExecOptions {
  script: vm.Script;
  context: vm.Context;
}

export class Isolated {

  constructor(private readonly filename: string) {}

  context(context: any = {}): vm.Context {
    const suite = new Suite()
    
    const globals = {
      
      
      Describe: suite.Describe.bind(suite),
      Skip: suite.Skip.bind(suite),
      Each: suite.Each.bind(suite),
      
      it: suite.it.bind(suite),
      only: suite.only.bind(suite),
      skip: suite.skip.bind(suite),
      each: suite.each.bind(suite),
      beforeEach: suite.beforeEach.bind(suite),
      beforeAll: suite.beforeAll.bind(suite),
      run: suite.run.bind(suite),

      console: new Console(),
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

  async exec({ script, context }: ExecOptions) : Promise<ExecResult> {
    try {
      const report = await script.runInNewContext(context);
      const isValid = this.isSuiteReport(report);

      return {
        status: isValid,
        error: null,
        report: isValid ? report : null
      };
    } catch (error: any) {
      return {
        status: false,
        error,
        report: null
      };
    }
  }

  isSuiteReport(report: any): report is SuiteReport {
    return (
      report !== null &&
      typeof report === 'object' &&
      typeof report.passed === 'boolean' &&
      typeof report.description === 'string' &&
      typeof report.metrics === 'object' &&
      typeof report.metrics.passed === 'number' &&
      typeof report.metrics.failed === 'number' &&
      typeof report.metrics.skipped === 'number' &&
      Array.isArray(report.tests) &&
      Array.isArray(report.hooks) &&
      Array.isArray(report.children)
    );
  }
}
