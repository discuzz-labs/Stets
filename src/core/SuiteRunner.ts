/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import { fork } from "child_process";
import path from "path";
import { TsConfig } from "../config/TsConfig";

export class SuiteRunner {
  private tsConfig: string;
  public file: string;
  
  constructor(file: string) {
    this.tsConfig = TsConfig.get()
    this.file = file
  }

  // Run a single test file in isolation
  public async runSuite(): Promise<void> {
    return new Promise((resolve, reject) => {
      const testProcess = fork(path.resolve(this.file), [], {
        execArgv: [
          "-r",
          "esbuild-register",
          
        ],
        stdio: ["inherit", "inherit", "inherit", "ipc"], // Enable IPC
      });

      // Listen for messages from the child process (test results)
      testProcess.on("message", (message: any) => {
        if (message.type === "results") {
          console.log(`Results from ${this.file}:`);
          message.results.forEach((result: any) => {
            if (result.passed) {
              console.log(`✔ ${result.description}`);
            } else {
              console.error(`✘ ${result.description}`);
              console.error(`  Error: ${result.error.message}`);
              console.error(`  Stack: ${result.error.stack}`);
            }
          });
        }
      });

      testProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test failed: ${this.file}`));
        }
      });
    });
  }
}

export default SuiteRunner;
