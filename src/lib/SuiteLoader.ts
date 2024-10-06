/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Config } from "./Config";
import { glob } from "glob";
import { Log } from "../utils/Log";
import { Reporter } from "../lib/Reporter";
import { Suite } from "../types";

export class SuiteLoader {
  private suites: Suite[] = [];

  /**
   * Loads all test files matching the pattern and initializes Test instances.
   */
  async loadSuites() {
    const config = Config.getInstance();

    const testDirectory = this.getTestDirectory(config);
    const filePattern = this.getFilePatterns(config, testDirectory);
    const excludePattern = config.getConfig("exclude");

    Log.info(`Tests directory: ${testDirectory}`);
    Log.info(`Using these file patterns: ${filePattern}`);
    Log.info(`Excluding these patterns: ${excludePattern}`);

    const allTestFiles = await this.findTestFiles(filePattern, excludePattern);

    if (allTestFiles.length === 0) {
      this.handleNoTestFiles(config);
      return; // Exit if no test files were found
    }

    Log.info(`Running Tests: ${allTestFiles}`);
    this.suites = this.initializeSuites(allTestFiles);
  }

  /**
   * Get the test directory from configuration.
   */
  private getTestDirectory(config: Config): string {
    return config.getConfig("testDirectory")
      ? `${config.getConfig("testDirectory")}/`
      : "";
  }

  /**
   * Get file patterns from configuration.
   */
  private getFilePatterns(config: Config, testDirectory: string): string[] {
    const filePatternConfig = config.getConfig("filePattern");

    // Apply '**/' for recursive searches if needed
    return Array.isArray(filePatternConfig)
      ? filePatternConfig.map((pattern: string) =>
          pattern.startsWith("**/")
            ? `${testDirectory}${pattern}`
            : `${testDirectory}**/${pattern}`,
        )
      : [`${testDirectory}**/${filePatternConfig}`];
  }

  /**
   * Find test files matching the provided patterns.
   */
  private async findTestFiles(
    filePattern: string[],
    excludePattern: string | string[] | undefined,
  ): Promise<string[]> {
    // Ensure excludePattern is always an array
    const excludeArray = Array.isArray(excludePattern)
      ? excludePattern
      : excludePattern
        ? [excludePattern]
        : ["**/node_modules/**"]; // Default exclusion

    const allTestFiles = glob.sync(filePattern, {
      ignore: excludeArray, // Apply exclusions
      nodir: true,
    });

    // Flatten the results and return
    return allTestFiles.flat();
  }

  /**
   * Handle the case when no test files were found.
   */
  private handleNoTestFiles(config: Config) {
    Log.error("No test files were found");
    console.log(
      Reporter.noSuitesFound(
        config.getConfig("filePattern"),
        config.getConfig("testDirectory"),
      ),
    );
    process.exit(0);
  }

  /**
   * Initialize suites from the found test files.
   */
  private initializeSuites(allTestFiles: string[]): Suite[] {
    return allTestFiles.map((file) => ({
      status: "pending",
      path: file,
      stdout: "",
    }));
  }

  /**
   * Get the loaded test suites.
   */
  getSuites(): Suite[] {
    return this.suites;
  }
}
