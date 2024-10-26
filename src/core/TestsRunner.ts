/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { Test } from "./Test"

export class TestsRunner {
  constructor(private testFiles: string[]) {}

  get() {
    return this.testFiles;
  }

  async runFiles() {
    Log.info("Loading test files...");
    Log.info(`${this.testFiles.length} test files loaded.`);

    // Execute all suites
    await Promise.all(
      this.testFiles.map(async (testFile) => {
        Log.info(`Running file: ${testFile}`);

        try {
          await new Test(testFile).run();
        } catch (error: any) {
          console.error("Unexpected behaviour Due to: ", error)
          process.exit(1)
        }
      }),
    );
  }
}
