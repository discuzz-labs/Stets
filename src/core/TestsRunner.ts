/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestFile } from "../types";
import { Log } from "../utils/Log";
import { BaseReporter } from "../reporters/BaseReporter";
import { Test } from "./Test";

export class TestsRunner {
  constructor(private testFiles: TestFile[]) {}

  get() {
    return this.testFiles;
  }

  async runFiles() {
    Log.info("Loading test files...");
    Log.info(`${this.testFiles.length} test files loaded.`);

    // Execute all suites
    await Promise.all(
      this.testFiles.map(async (testFile) => {
        Log.info(`Running file: ${testFile.path}`);
        BaseReporter.onTestFileStart({
          path: testFile.path,
        });

        const startTime = Date.now(); // Start tracking suite duration
        
        try {
          testFile.report = await new Test(testFile.path).run();
          testFile.status = testFile.report.result.passed ? "success" : "failed"
        } catch (error: any) {
          testFile.error = error;
          testFile.status = "failed"
        }
        
        const endTime = Date.now(); // End tracking suite duration
        // Calculate and set the duration for the whole suite
        testFile.duration = endTime - startTime;
      }),
    );
  }
}
