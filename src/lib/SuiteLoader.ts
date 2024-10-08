/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Config } from "./Config";
import { glob } from "glob";
import { Log } from "../utils/Log";
import { SuiteCase } from "../types";
import path from "path";

export class SuiteLoader {
  private suiteCases: SuiteCase[] = [];

  /**
   * Loads all test files by dynamically importing them and initializes Suite instances.
   */
  async loadSuites(): Promise<void> {
    const config = Config.getInstance();

    const testDirectory = this.getTestDirectory(config);
    const filePatterns = this.getFilePatterns(config, testDirectory);
    const excludePatterns = config.getConfig("exclude");

    Log.info(`Tests directory: ${testDirectory}`);
    Log.info(`Using file patterns: ${filePatterns}`);
    Log.info(`Excluding patterns: ${excludePatterns}`);

    const testFiles = await this.findTestFiles(filePatterns, excludePatterns);

    if (testFiles.length === 0) {
      this.noSuitesFound(filePatterns, testDirectory);
      return;
    }

    Log.info(`Found test files: ${testFiles}`);

    await this.importAndInitializeSuites(testFiles);
  }

  /**
   * Get the test directory from configuration.
   */
  private getTestDirectory(config: Config): string {
    const testDirectory = config.getConfig("testDirectory");
    return testDirectory ? `${testDirectory}/` : "";
  }

  /**
   * Get file patterns from configuration and prepend the test directory.
   */
  private getFilePatterns(config: Config, testDirectory: string): string[] {
    const filePatternConfig = config.getConfig("filePattern");

    return Array.isArray(filePatternConfig)
      ? filePatternConfig.map((pattern: string) =>
          this.prependDirectory(pattern, testDirectory),
        )
      : [this.prependDirectory(filePatternConfig, testDirectory)];
  }

  /**
   * Prepends the directory to the file pattern, ensuring
   * **/

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
   * Dynamically imports each test file and initializes Suite instances.
   */
  private async importAndInitializeSuites(testFiles: string[]): Promise<void> {
    for (const file of testFiles) {
      try {
        require("esbuild-register"); // Allow TypeScript support
        const suiteModule = require(path.join(process.cwd(), file)); // Import suite

        // Check if the default export exists and is an instance of Suite
        const suite = suiteModule.default || suiteModule; // Handle CommonJS default export scenario
        if (suite && suite.constructor.name === "Suite") {
          this.suiteCases.push({
            status: "pending",
            path: file,
            suite,
            duration: -1,
            reports: []
          });
          Log.info(`Loaded suite: ${file}`);
        } else {
          Log.warning(`Test file ${file} does not export a valid Suite.`);
        }
      } catch (error: any) {
        Log.error(`Failed to load suite from ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Get the loaded test suites.
   */
  getSuites(): SuiteCase[] {
    return this.suiteCases;
  }

  /**
   * Handle the case where no suites are found.
   */
  private noSuitesFound(
    filePattern: string[] | string,
    testDirectory: string,
  ): void {
    const patterns = Array.isArray(filePattern) ? filePattern : [filePattern];
    Log.error("No test files were found.");
    console.log(
      `No suites were found applying the following pattern(s): ${patterns.join(", ")} in the directory: ${testDirectory}`,
    );
    process.exit(0);
  }
}
