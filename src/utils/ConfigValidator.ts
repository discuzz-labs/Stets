/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import path from "path";
import { TestConfig } from "../types";
import config from "../stets.config"
import { Log } from "../utils/Log";
import { File } from "../utils/File";


export class ConfigValidator {
  private config: TestConfig = config
  private errors: string[] = [];
  
  /**
   * Run all validation checks on the config.
   */
  constructur() {
    if(this.config.suppressValidations) {
      console.warn("Suppressing config validation! Can cause unexpected behaviour.")
      return true
    }
    Log.info("Validating Config...");
    this.checkRequiredFields();
    this.checkTestDirectory();
    this.checkFilePattern();
    this.checkExcludePattern();
    this.checkLogicalConsistency();
    this.checkValidFilePatterns();
    this.checkValidExcludePatterns();
    this.checkTestDirectoryExisting();
    this.checkValidReporters()
    this.checkOutputDirectory()
    Log.info("Config validation completed.");

    if (this.errors.length > 0) {
      this.logErrors();
      process.abort()
    }
  }

  /**
   * Check if reporters contain duplicate values and are valid.
   */
  private checkValidReporters() {
    const validReporters = new Set(["spec", "xml", "json", "csv", "html"]);

    if (this.config.reporters) {
      const reporters = Array.isArray(this.config.reporters)
        ? this.config.reporters
        : [this.config.reporters];

      // Check for duplicates
      const duplicates = reporters.filter(
        (reporter, index) => reporters.indexOf(reporter) !== index,
      );
      if (duplicates.length > 0) {
        this.errors.push(`Duplicate reporters found: ${duplicates.join(", ")}`);
      }

      // Check for valid reporters
      reporters.forEach((reporter) => {
        if (!validReporters.has(reporter)) {
          this.errors.push(
            `Invalid reporter: ${reporter}. Valid options are: ${Array.from(validReporters).join(", ")}`,
          );
        }
      });
    }
  }

  /**
   * Check if output directory exists if it was set.
   */
  private checkOutputDirectory() {
    if (this.config.outputDir) {
      const outputDirPath = path.join(process.cwd(), this.config.outputDir);
      if (!new File(outputDirPath).isExisting()) {
        this.errors.push(
          `Output directory ${this.config.outputDir} does not exist.`,
        );
      }
    }
  }

  private checkTestDirectoryExisting() {
    if (
      new File(
        path.join(process.cwd(), this.config.testDirectory),
      ).isExisting() === false
    ) {
      this.errors.push(
        `Test directory ${this.config.testDirectory} does not exsit`,
      );
    }
  }
  /**
   * Check if required fields are present.
   */
  private checkRequiredFields() {
    const requiredFields: (keyof TestConfig)[] = ["filePattern"];
    requiredFields.forEach((field: keyof TestConfig) => {
      if (!this.config[field]) {
        this.errors.push(`Missing required field: ${field}`);
      }
    });
  }

  /**
   * Check if testDirectory is valid.
   */
  private checkTestDirectory() {
    if (typeof this.config.testDirectory !== "string") {
      this.errors.push("testDirectory must be a string");
    }
    if (this.config.testDirectory.includes("node_modules")) {
      this.errors.push("testDirectory should not point to 'node_modules'");
    }
  }

  /**
   * Check if filePattern is valid.
   */
  private checkFilePattern() {
    if (
      typeof this.config.filePattern !== "string" &&
      !Array.isArray(this.config.filePattern)
    ) {
      this.errors.push("filePattern must be a string or an array of strings");
    }
  }

  /**
   * Check if excludePattern is valid.
   */
  private checkExcludePattern() {
    if (
      this.config.exclude &&
      typeof this.config.exclude !== "string" &&
      !Array.isArray(this.config.exclude)
    ) {
      this.errors.push("exclude must be a string or an array of strings");
    }
  }

  /**
   * Check for logical consistency in the configuration.
   * Ensure the exclude pattern doesn't exclude all test files.
   */
  private checkLogicalConsistency() {
    if (this.config.exclude && this.config.filePattern) {
      const filePatterns = Array.isArray(this.config.filePattern)
        ? this.config.filePattern
        : [this.config.filePattern];
      const excludePatterns = Array.isArray(this.config.exclude)
        ? this.config.exclude
        : [this.config.exclude];

      const allExcluded = filePatterns.every((pattern) =>
        excludePatterns.includes(pattern),
      );

      if (allExcluded) {
        this.errors.push("excludePattern excludes all test files.");
      }
    }
  }

  /**
   * Check if file patterns are valid glob patterns.
   */
  private checkValidFilePatterns() {
    const filePatterns = Array.isArray(this.config.filePattern)
      ? this.config.filePattern
      : [this.config.filePattern];

    filePatterns.forEach((pattern) => {
      if (!this.isValidGlobPattern(pattern)) {
        this.errors.push(`Invalid filePattern: ${pattern}`);
      }
    });
  }

  /**
   * Check if exclude patterns are valid glob patterns.
   */
  private checkValidExcludePatterns() {
    if (this.config.exclude) {
      const excludePatterns = Array.isArray(this.config.exclude)
        ? this.config.exclude
        : [this.config.exclude];

      excludePatterns.forEach((pattern) => {
        if (!this.isValidGlobPattern(pattern)) {
          this.errors.push(`Invalid excludePattern: ${pattern}`);
        }
      });
    }
  }

  /**
   * Helper method to validate glob patterns.
   * Uses minimatch to check if the pattern is valid.
   */
  private isValidGlobPattern(pattern: string): boolean {
    try {
      const minimatch = require("minimatch");
      return minimatch.makeRe(pattern) instanceof RegExp;
    } catch (error) {
      return false;
    }
  }

  /**
   * Log the errors found during validation.
   */
  private logErrors() {
    console.error("Configuration validation failed with the following errors:");
    this.errors.forEach((error) => console.error(error));
  }
}
