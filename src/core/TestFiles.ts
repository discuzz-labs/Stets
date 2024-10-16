/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { TestFile } from "../types";
import fg from "fast-glob";
import { Config } from "../config/Config"; // Assuming you have a Config class

export class TestFiles {
  private testFiles: TestFile[] = [];
  private config: Config = Config.init();

  /**
   * Loads all test files by dynamically importing them and initializes Suite instances.
   */
  load(): void {
    try {
      const testDirectory = this.config.get("testDirectory") || "";
      const filePatternConfig = this.config.get("filePattern");
      const excludePatterns = this.config.get("exclude");

      // Convert test directory to a glob pattern
      const directoryPattern = testDirectory === "" ? testDirectory : fg.convertPathToPattern(testDirectory);

      const filePatterns = Array.isArray(filePatternConfig)
        ? filePatternConfig.map((pattern: string) => directoryPattern ? `${directoryPattern}/${pattern}` : pattern)
        : directoryPattern ? [`${directoryPattern}/${filePatternConfig}`] : [filePatternConfig];

      Log.info(`Tests directory: ${testDirectory}`);
      Log.info(`Using file patterns: ${filePatterns.join(", ")}`);
      Log.info(`Excluding patterns: ${excludePatterns ? excludePatterns : "None"}`);

      
      // Use fast-glob to find test files with optional exclusions
      const files = fg.sync(filePatterns, {
        ignore: excludePatterns,
        onlyFiles: true,
        dot: false,
        absolute: true
      });

      if (files.length === 0) {
        Log.error("No test files were found.");
        console.log(
          `No suites were found applying the following pattern(s): ${filePatterns.join(
            ", "
          )} in the directory: ${testDirectory}`
        );
        process.exit(1);
      }

      this.testFiles = files.map((testFile) => ({
        duration: 0,
        report: {
          description: "Root Suite",
          result: {
            passed: false,
            hooks: [],
            tests: []
          },
          children: [],
          error: { message: null, stack: null}
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
