/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuitePathLoader } from "./SuitePathLoader";
import { Log } from "../utils/Log";
import { SuiteCase } from "../types";
import { register } from "esbuild-register/dist/node";
import { TsConfig } from "../utils/TsConfig";
import chalk from "chalk";
import path from "path";

export class SuitesLoader {
  private suiteCases: SuiteCase[] = [];
  private errors: string[] = [];

  /**
   * Loads all test files by dynamically importing them and initializes Suite instances.
   */
  async loadSuites(): Promise<void> {
    const suitePathLoader = new SuitePathLoader();

    const testFiles = await suitePathLoader.getTestFiles();

    if (testFiles.length === 0) {
      suitePathLoader.noSuitesFound();
      return;
    }

    Log.info(`Found test files: ${testFiles}`);

    register({
      tsconfigRaw: TsConfig.get(),
    });

    await this.importAndInitializeSuites(testFiles);
    this.displayErrors();
  }

  /**
   * Dynamically imports each test file and initializes Suite instances.
   */
  private async importAndInitializeSuites(testFiles: string[]): Promise<void> {
    for (const file of testFiles) {
      try {
        const suiteModule = require(path.join(process.cwd(), file)); // Import suite

        // Check if the default export exists and is an instance of Suite
        const suite = suiteModule.default || suiteModule; // Handle CommonJS default export scenario
        if (suite && suite.constructor.name === "Suite") {
          this.suiteCases.push({
            status: "pending",
            path: file,
            suite,
            duration: -1,
            reports: [],
          });
          Log.info(`Loaded suite: ${file}`);
        } else {
          this.errors.push(
            `Test file ${file} does not export a valid Suite.`
          );
        }
      } catch (error: any) {
        this.errors.push(
          `Failed to load suite from ${file}: ${error.message}`
        );
      }
    }
  }

  /**
   * Display all collected errors at once.
   */
  private displayErrors(): void {
    if (this.errors.length > 0) {
      console.log(chalk.bgRed("Errors occurred during suite loading:"));
      this.errors.forEach((error) => console.log(chalk.red("#"), error, "\n"));
      process.exit(1);
    }
  }

  /**
   * Get the loaded test suites.
   */
  getSuites(): SuiteCase[] {
    return this.suiteCases;
  }
}
