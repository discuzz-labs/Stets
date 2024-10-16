/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { TestFile } from "../types";
import { Config } from "../config/Config"; // Assuming you have a Config class
import { Glob } from "./Glob";

export class TestFiles {
  private testFiles: TestFile[] = [];
  private config: Config = Config.init();

  /**
   * Loads all test files by dynamically importing them and initializes Suite instances.
   */
  async load(): Promise<void> {
    try {
      const testDirectory = this.config.get("testDirectory") || "";
      const filePattern = this.config.get("filePattern");
      const excludePatterns = this.config.get("exclude");

      Log.info(`Tests directory: ${testDirectory}`);
      Log.info(`Using file patterns: ${filePattern}`);
      Log.info(
        `Excluding patterns: ${excludePatterns ? excludePatterns : "None"}`,
      );

      // Use Glob to find test files
      const parser = new Glob({
        ignoreDotFiles: true,
        excludedPattern: excludePatterns
          ? Array.isArray(excludePatterns)
            ? excludePatterns
            : [excludePatterns]
          : null,
        searchInOneFolder: testDirectory ? testDirectory : null,
      });

      // Now, pass the directory and file patterns to Glob
      const files = await parser.parse(testDirectory, filePattern);
      
      if (files.length === 0) {
        Log.error("No test files were found.");
        process.stdout.write(
          `No suites were found applying the following pattern(s): ${filePattern} in the directory: ${testDirectory}`,
        );
        process.exit(1);
      }

      this.testFiles = files.map((testFile) => ({
        duration: 0,
        report: {
          description: "Parent Suite",
          duration: 0,
          passed: true,
          passedTests: 0,
          failedTests: 0,
          hooks: [],
          tests: [],
          children: [],
        },
        path: testFile,
        status: "pending",
      }));

      Log.info(`Found test files: ${files.join(", ")}`);
    } catch (error: any) {
      console.error(`Failed to load files: ${error}`);
      process.exit(1);
    }
  }

  get() {
    return this.testFiles;
  }
}
