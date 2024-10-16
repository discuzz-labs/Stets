/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import { fork } from "child_process";
import { SuiteReport } from "../types";
import { Log } from "../utils/Log";
import { RuntimeError } from "../errors/RuntimeError";
import kleur from "kleur";

export class Test {
  constructor(public file: string) {}

  // Run a single test file in isolation
  public async run(): Promise<SuiteReport> {
    return new Promise((resolve, reject) => {
      const testProcess = fork(this.file, {
        execArgv: ["-r", "esbuild-register"],
        stdio: ["pipe", "pipe", "pipe", "ipc"], // Enable IPC
      });

      // Capture any build errors from esbuild
      let buildError: string = "";

      testProcess.stderr?.on("data", (data) => {
        buildError += data.toString();
      });

      // Listen for messages from the child process (test results)
      testProcess.on("message", (message: any) => {
        if (message.type === "report") {
          Log.info(`Results from ${this.file}:`);
          Log.info(JSON.stringify(message.report, null, 2));

          if (!this.isSuiteReport(message.report)) {
            reject(
              new RuntimeError({
                description: "Invalid report format",
                message: `The report received from the test file at ${this.file} is not a valid SuiteReport.`,
              })
            );
          } else {
            resolve(message.report);
          }
        }
      });

      // Handle process close event
      testProcess.on("close", (code) => {
        if (code !== 0) {
          if (buildError) {
            // Capture and format esbuild errors with colors
            reject(
              new SyntaxError(this.prettyPrintEsbuildError(buildError))
            );
          } else {
            reject(
              new RuntimeError({
                description: "Process error",
                message: `Test file at ${this.file} did not send any reports.`,
              })
            );
          }
        }
      });

      testProcess.on("error", (error) => {
        reject(
          new RuntimeError({
            description: "Process error",
            message: `An error occurred while running the test file at ${this.file}: ${error.message}`,
            stack: error.stack || "No stack trace available",
          })
        );
      });
    });
  }

  // Helper function to pretty-print esbuild errors
  private prettyPrintEsbuildError(error: string): string {
    return error
      .split("\n")
      .map((line) => (line.includes("error") ? kleur.red(line) : kleur.yellow(line)))
      .join("\n");
  }

  // Type guard to check if the object is a SuiteReport
  private isSuiteReport(report: any): report is SuiteReport {
    return (
      typeof report === "object" &&
      typeof report.description === "string" &&
      typeof report.result === "object" &&
      Array.isArray(report.children)
    );
  }
}
