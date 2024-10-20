/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import fs from "fs";
import path from "path";
import vm from "vm";
import { createRequire } from "module";
import check from "syntax-error";
import { Reporter } from "./Reporter";
import Suite, { SuiteCase } from "../framework/Suite";
import { SuiteRunner } from "./SuiteRunner";
import { ErrorFormatter } from "../utils/ErrorFormatter";
import { describe } from "node:test";

export class Test {

  constructor(private file: string) {}

  public async run(): Promise<void> {
    const startTime = Date.now();
    try {
      const code = this.loadTestFile();
      if (this.hasSyntaxErrors(code)) return;

      const sandbox = this.createSandbox();
      const script = new vm.Script(code, { filename: this.file });
      Log.info(`Executing ${this.file} in isolated VM...`);

      const suite = await script.runInNewContext(sandbox);

      if (!this.isSuite(suite)) {
        this.reportInvalidSuite(startTime);
        return;
      }

      const report = await new SuiteRunner(suite).run();

      this.handleReport(report, startTime);
    } catch (error: any) {
      this.handleError(error, startTime);
    }
  }

  private loadTestFile(): string {
    const filePath = path.resolve(this.file);
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error: any) {
      throw new Error(
        `Failed to load test file ${this.file}: ${error.message}`,
      );
    }
  }

  private hasSyntaxErrors(code: string): boolean {
    const syntaxError = check(code, this.file);
    if (syntaxError) {
      Reporter.reportTestFile(this.file, 0);
      console.log(syntaxError.toString());
      return true;
    }
    return false;
  }

  private createSandbox(): vm.Context {
    const customRequire = createRequire(path.resolve(this.file));
    return vm.createContext({
      global: {},
      globalThis: {},
      require: customRequire,
    });
  }

  private async handleReport(report: any, startTime: number): Promise<void> {
    Log.info(`Results from ${this.file}:`);
    const duration = Date.now() - startTime;

    Reporter.reportTestFile(this.file, duration);
    Reporter.reportSuite(report, -1);
  }

  private handleError(error: any, startTime: number): void {
    const duration = Date.now() - startTime;
    Reporter.reportTestFile(this.file, duration);
    new ErrorFormatter().format(error.message, error.stack ?? "")
  }

  private reportInvalidSuite(startTime: number): void {
    const duration = Date.now() - startTime;
    Reporter.reportTestFile(this.file, duration);
    console.log(
      `The suite received from the test file ${this.file} is not a valid Suite. You probably forgot to call run() at the end of the file.`,
    );
  }

 isSuite(obj: any): obj is SuiteCase {
    return (
      obj &&
      typeof obj.description === "string" &&
      Array.isArray(obj.tests) &&
      obj.tests.every(
        (test: any) =>
          typeof test.description === "string" && typeof test.fn === "function",
      ) &&
      Array.isArray(obj.hooks) &&
      obj.hooks.every(
        (hook: any) =>
          (hook.type === "beforeAll" || hook.type === "beforeEach") &&
          typeof hook.fn === "function",
      ) &&
      Array.isArray(obj.children) &&
      obj.children.every((child: any) => this.isSuite(child)) // Arrow function to maintain context of 'this'
    );
  }
}
