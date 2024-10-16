/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteReport } from "../types";
import { Log } from "../utils/Log";
import fs from "fs";
import path from "path";
import { BuildError } from "../errors/BuildError";
import { ProcessError } from "../errors/ProcessError";
import vm from "vm";
import { createRequire } from "module"; // Import createRequire

export class Test {
  constructor(public file: string) {}

  public async run(): Promise<SuiteReport> {
    try {
      const code = this.loadTestFile();  // Load the test file content
      const sandbox = this.createSandbox();  // Create an isolated sandbox
      const script = new vm.Script(code);  // Compile the test code
      Log.info(`Executing ${this.file} in isolated VM...`);
      const report = await script.runInNewContext(sandbox);  // Run the test code in the VM
      if (this.isSuiteReport(report)) {
        Log.info(`Results from ${this.file}:`);
        Log.info(JSON.stringify(report, null, 2));
        return report;  // Return the updated report object
      } else {
        throw new ProcessError({
          path: this.file,
          message: `The report received from the test file is not a valid SuiteReport.`,
        });
      }
    } catch (error) {
      throw this.handleExecutionError(error);
    }
  }

  private loadTestFile(): string {
    try {
      const filePath = path.resolve(this.file);
      return fs.readFileSync(filePath, "utf-8");
    } catch (error: any) {
      throw new BuildError({
        path: this.file,
        message: `Failed to load test file: ${error.message}`,
      });
    }
  }

  private createSandbox(): vm.Context {
    const customRequire = createRequire(path.resolve(this.file)); // Use createRequire to resolve modules relative to the file

    const sandbox = vm.createContext({
      global: {},
      globalThis: {},
      require: customRequire, // Use the customRequire here
    });

    return sandbox;
  }

  private handleExecutionError(error: any): ProcessError | BuildError {
    if (error instanceof SyntaxError) {
      return new BuildError({
        path: this.file,
        message: `Syntax error in test file: ${error.message}`,
      });
    } else {
      return new ProcessError({
        path: this.file,
        message: `Error executing test file: ${error.message}`,
      });
    }
  }

  private isSuiteReport(report: any): report is SuiteReport {
    return (
      typeof report === "object" &&
      typeof report.description === "string" &&
      typeof report.passedTests === "number" &&
      typeof report.failedTests === "number" &&
      Array.isArray(report.children)
    );
  }
}
