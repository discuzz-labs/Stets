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
import type { SuiteCase } from "../framework/Suite";
import { SuiteRunner } from "./SuiteRunner";
import { Formatter } from "../utils/Formatter";
import { ConsoleMock } from "./mocks";
import kleur from "../utils/kleur";

export class Test {
  private consoleMock: ConsoleMock;

  constructor(private file: string) {
    // Initialize ConsoleMock to capture console logs
    this.consoleMock = new ConsoleMock();
  }

  public async run(): Promise<void> {
    const startTime = Date.now();
    try {
      let code = this.loadTestFile();
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
      console: this.consoleMock, // Use the ConsoleMock here for the VM context
      require: customRequire,
    });
  }

  private async handleReport(report: any, startTime: number): Promise<void> {
    Log.info(`Results from ${this.file}:`);
    const duration = Date.now() - startTime;

    Reporter.reportTestFile(this.file, duration);
    Reporter.reportSuite(report, this.file);

    this.replayLogs();
  }

  private handleError(error: any, startTime: number): void {
    const duration = Date.now() - startTime;
    Reporter.reportTestFile(this.file, duration);
    Formatter.formatError(error.message, error.stack ?? "");
  }

  private reportInvalidSuite(startTime: number): void {
    const duration = Date.now() - startTime;
    Reporter.reportTestFile(this.file, duration);
    console.log(
      `The suite received from the test file ${this.file} is not a valid Suite. You probably forgot to call run() at the end of the file.`,
    );

    this.replayLogs();
  }

  // Method to replay the logs
  private replayLogs(): void {
    this.consoleMock.logs.forEach((log) => {
      const { method, args, stack } = log;
      console.log(kleur.blue(kleur.bold(`\nConsole.${method}()\n`)));
      // Dynamically call the method using keyof Console to ensure it's valid
      {
        (console[method as keyof Console] as Function)(...args);
      }
      
      Formatter.parseStack(stack ?? "" , 4, this.file)
    });
  }

  private isSuite(obj: any): obj is SuiteCase {
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
      obj.children.every((child: any) => this.isSuite(child))
    );
  }
}
