/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Loader } from "../core/Loader";
import { Isolated } from "../core/Isolated";
import { Formatter } from "../utils/Formatter";
import { Reporter } from "../reporters/Reporter";

export class TestsPooler {
  constructor(
    private reporters: string[],
    private outputDir: string,
    private files: string[],
  ) {}

  // Runs all tests in parallel
  public async runTests(): Promise<void> {
    await Promise.all(this.files.map((file) => this.runSingleTest(file)));
  }

  // Runs a single test, with error handling and reporting
  private async runSingleTest(filename: string): Promise<void> {
    const startTime = Date.now();

    try {
      const { code, loadedFile } = this.loadFile(filename);
      const report = await this.executeIsolatedTest(code, loadedFile);
      this.processReport(report, filename, loadedFile, startTime);
    } catch (error: any) {
      this.handleError(filename, error, startTime);
    }
  }

  // Loads the file and retrieves the code to be tested
  private loadFile(filename: string): { code: string; loadedFile: string } {
    const { code, filename: loadedFile } = new Loader().require(filename);
    if (!code || !loadedFile)
      throw new Error(`Failed to load file: ${filename}`);
    return { code, loadedFile };
  }

  // Executes the isolated test in a sandboxed environment
  private async executeIsolatedTest(code: string, loadedFile: string) {
    const isolated = new Isolated(loadedFile);
    const script = isolated.script(code);
    const context = isolated.context();
    return await isolated.exec({ script, context });
  }

  // Processes the report and logs the results
  private processReport(
    report: any,
    filename: string,
    loadedFile: string,
    startTime: number,
  ): void {
    const duration = Date.now() - startTime;
    Reporter.reportTestFile(filename, duration);

    if (report.status && !report.error && report.report) {
      Reporter.reportSuite(report.report, loadedFile, -1);
      if (this.reporters.length !== 0) {
        Reporter.writeReport(
          this.reporters,
          this.outputDir,
          loadedFile,
          report.report,
        );
      }
    } else if (!report.status && !report.error && !report.report) {
      console.log(`File ${loadedFile} didn't call run() at all!`);
    } else if (report.error) {
      Formatter.formatError(
        report.error.message,
        report.error.stack || "",
        20,
        loadedFile,
      );
    }
  }

  // Handles errors during test execution and logs them
  private handleError(filename: string, error: any, startTime: number): void {
    const duration = Date.now() - startTime;
    Reporter.reportTestFile(filename, duration);
    Formatter.formatError(error.message, error.stack || "", 20, filename);
  }
}
