/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { fork, ChildProcess } from "child_process";
import { SuiteReport } from "../types";
import { Log } from "../utils/Log";
import path from "path";
import { BuildError } from "../errors/BuildError";
import { ProcessError } from "../errors/ProcessError";

export class Test {
  constructor(public file: string) {}

  // Run a single test file in isolation
  public async run(): Promise<SuiteReport> {
    return new Promise((resolve, reject) => {
      const testProcess = this.createTestProcess()
      testProcess.on("message", (message: any) =>
        this.handleMessage(message, resolve, reject)
      );

      testProcess.on("close", () => 
        this.handleProcessClose(reject)
      );
    });
  }

  // Create and configure the test process
  public createTestProcess(): ChildProcess {
    return fork(this.file, {
      execArgv: [
        "-r",
        //path.resolve(__dirname, "..", "scripts", "register-esbuild.js"),
      ], // Register esbuild programmatically
      stdio: ["pipe", "pipe", "pipe", "ipc"], // Enable IPC
    });
  }

  // Handle incoming messages from the test process
  private handleMessage(
    message: any,
    resolve: (report: SuiteReport) => void,
    reject: (error: Error) => void
  ) {
    if (message.type === "report") {
      this.processReport(message, resolve, reject);
    } else if (message.type === "buildError") {
      this.processBuildError(message, reject);
    }
  }

  // Handle the test report message
  private processReport(
    message: any,
    resolve: (report: SuiteReport) => void,
    reject: (error: Error) => void
  ) {
    Log.info(`Results from ${this.file}:`);
    Log.info(JSON.stringify(message.report, null, 2));

    if (!this.isSuiteReport(message.report)) {
      reject(
        new ProcessError({
          path: this.file,
          message: `The report received from the test file is not a valid SuiteReport.`,
        })
      );
    } else {
      resolve(message.report);
    }
  }

  // Handle build errors received from the test process
  private processBuildError(
    message: any,
    reject: (error: Error) => void
  ) {
    reject(
      new BuildError({
        path: this.file,
        message: message.error,
      })
    );
  }

  // Handle when the test process closes without sending a report
  private handleProcessClose(reject: (error: Error) => void) {
    reject(
      new ProcessError({
        path: this.file,
        message: `Test file did not send any reports.`,
      })
    );
  }

  // Validate that the object is a SuiteReport
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
