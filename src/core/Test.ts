/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import { fork } from "child_process";
import { SuiteReport } from "../types";
import { Log } from "../utils/Log";
import { RuntimeError } from "../errors/RuntimeError";
import path from "path";
import { BuildError } from "../errors/BuildError";

export class Test {
  constructor(public file: string) {}

  // Run a single test file in isolation

  public async run(): Promise<SuiteReport> {
    return new Promise((resolve, reject) => {
      const testProcess = fork(this.file, {
        execArgv: [
          "-r",
          path.resolve(__dirname, "..", "scripts", "register-esbuild.js"),
        ], // Register esbuild programmatically
        stdio: ["pipe", "pipe", "pipe", "ipc"], // Enable IPC
      });

      testProcess.on("message", (message: any) => {
        if (message.type === "report") {
          Log.info(`Results from ${this.file}:`);
          Log.info(JSON.stringify(message.report, null, 2));

          if (!this.isSuiteReport(message.report)) {
            reject(
              new RuntimeError({
                description: "Invalid report format",
                message: `The report received from the test file at ${this.file} is not a valid SuiteReport.`,
              }),
            );
          } else {
            resolve(message.report);
          }
        } 

        if(message.type === "buildError"){
          reject(new BuildError(this.file, message.error))
        }
      });

      testProcess.on("close", (code) => {
        reject(
          new RuntimeError({
            description: "Process error",
            message: `Test file at ${this.file} did not send any reports.`,
          }),
        );
      });
      
    });
  }

  private isSuiteReport(report: any): report is SuiteReport {
    return (
      typeof report === "object" &&
      typeof report.description === "string" &&
      typeof report.result === "object" &&
      Array.isArray(report.children)
    );
  }
}
