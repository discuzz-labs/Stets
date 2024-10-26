/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { Stream } from "./Stream";
import { Reporter } from "./Reporter";
import type { SuiteCase } from "../framework/Suite";
import { SuiteRunner } from "./SuiteRunner";
import { Formatter } from "../utils/Formatter";
import { VM } from "./Vm";

export class Test {
  private vm: VM;

  constructor(private file: string) {
    // Initialize the VM with the test file path
    this.vm = new VM(file);
  }

  public async run(): Promise<void> {
    const startTime = Date.now();
    try {
      // Use Stream class to process and read the file content efficiently
      const code = await new Stream(this.file).processFile();

      // Execute the transformed code in an isolated VM context
      const suite = await this.vm.executeScript(code);

      // Validate if the returned object is a Suite
      if (!this.isSuite(suite)) {
        this.reportInvalidSuite(startTime);
        return;
      }

      // Run the suite using the SuiteRunner class
      const report = await new SuiteRunner(suite).run();

      // Handle the report and output the results
      this.handleReport(report, startTime);
    } catch (error: any) {
      // Handle any errors that occurred during execution
      this.handleError(error, startTime);
    }
  }

  private async handleReport(report: any, startTime: number): Promise<void> {
    Log.info(`Results from ${this.file}:`);
    const duration = Date.now() - startTime;

    // Report the results of the test file execution
    Reporter.reportTestFile(this.file, duration);
    Reporter.reportSuite(report, this.file);

    // Replay any captured console logs from the VM execution
    this.vm.replayLogs();
  }

  private handleError(error: any, startTime: number): void {
    const duration = Date.now() - startTime;

    // Report that an error occurred and display formatted error details
    Reporter.reportTestFile(this.file, duration);
    Formatter.formatError(error.message, error.stack ?? "");
  }

  private reportInvalidSuite(startTime: number): void {
    const duration = Date.now() - startTime;

    // Report that an invalid Suite was received and provide guidance
    Reporter.reportTestFile(this.file, duration);
    console.log(
      `The suite received from the test file ${this.file} is not a valid Suite. You probably forgot to call run() at the end of the file.`,
    );

    // Replay any captured console logs from the VM execution
    this.vm.replayLogs();
  }

  private isSuite(obj: any): obj is SuiteCase {
    // Check if the object matches the structure of a SuiteCase
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