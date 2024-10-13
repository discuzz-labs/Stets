/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Config } from "../config/Config";
import { glob } from "glob";
import { Log } from "../utils/Log";

export class SuitePathLoader {
  private config: Config;
  
  constructor() {
    this.config = Config.getInstance();
  }

  /**
   * Retrieves the test files based on the provided config.
   */
  async getTestFiles(): Promise<string[]> {
    const testDirectory = this.getTestDirectory();
    const filePatterns = this.getFilePatterns(testDirectory);
    const excludePatterns = this.config.getConfig("exclude");

    Log.info(`Tests directory: ${testDirectory}`);
    Log.info(`Using file patterns: ${filePatterns}`);
    Log.info(`Excluding patterns: ${excludePatterns}`);

    return this.findTestFiles(filePatterns, excludePatterns);
  }

  /**
   * Get the test directory from configuration.
   */
  private getTestDirectory(): string {
    const testDirectory = this.config.getConfig("testDirectory");
    return testDirectory ? `${testDirectory}/` : "";
  }

  /**
   * Get file patterns from configuration and prepend the test directory.
   */
  private getFilePatterns(testDirectory: string): string[] {
    const filePatternConfig = this.config.getConfig("filePattern");

    return Array.isArray(filePatternConfig)
      ? filePatternConfig.map((pattern: string) =>
          this.prependDirectory(pattern, testDirectory),
        )
      : [this.prependDirectory(filePatternConfig, testDirectory)];
  }

  /**
   * Prepends the directory to the file pattern, ensuring proper structure.
   */
  private prependDirectory(pattern: string, testDirectory: string): string {
    return pattern.startsWith("**/")
      ? `${testDirectory}${pattern}`
      : `${testDirectory}**/${pattern}`;
  }

  /**
   * Find test files matching the provided patterns and apply exclusions.
   */
  private async findTestFiles(
    filePatterns: string[],
    excludePatterns: string | string[] | undefined,
  ): Promise<string[]> {
    const excludeArray = Array.isArray(excludePatterns)
      ? excludePatterns
      : excludePatterns
      ? [excludePatterns]
      : ["**/node_modules/**"]; // Default exclusion

    const testFiles = glob.sync(filePatterns, {
      ignore: excludeArray,
      nodir: true,
    });

    return testFiles.flat();
  }

  /**
   * Handle the case where no suites are found.
   */
  noSuitesFound(): void {
    const filePattern = this.config.getConfig("filePattern");
    const testDirectory = this.getTestDirectory();
    const patterns = Array.isArray(filePattern) ? filePattern : [filePattern];

    Log.error("No test files were found.");
    console.log(
      `No suites were found applying the following pattern(s): ${patterns.join(
        ", ",
      )} in the directory: ${testDirectory}`,
    );
    process.exit(0);
  }
}
