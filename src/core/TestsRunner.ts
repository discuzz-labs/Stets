/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestFile } from "../types";
import { Log } from "../utils/Log";
import { SpecReporter } from "../reporters/SpecReporter";
import { SuiteRunner } from "./SuiteRunner";

export class TestsRunner {
  constructor(private testFiles: TestFile[]){}

  get() {
    return this.testFiles
  }
  
  async runFiles() {
    Log.info("Loading test files...");
    Log.info(`${this.testFiles.length} test files loaded.`);

    // Execute all suites
    await Promise.all(
      this.testFiles.map(async (testFile) => {
        Log.info(`Running file: ${testFile.path}`);
        SpecReporter.onSuiteStart({
          path: testFile.path,
          description: testFile.path
        });
        const suiteStartTime = Date.now(); // Start tracking suite duration
        await new SuiteRunner(testFile.path).runSuite()
        const suiteEndTime = Date.now(); // End tracking suite duration
        // Calculate and set the duration for the whole suite
        testFile.duration = suiteEndTime - suiteStartTime;
      }),
    );
  }
}
