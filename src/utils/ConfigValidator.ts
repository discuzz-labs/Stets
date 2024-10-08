/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import path from "path";
import { TestConfig } from "../types";
import { Log } from "../utils/Log";
import { File } from "./File";

export class ConfigValidator {
  private config: TestConfig;
  private errors: string[] = [];

  constructor(config: TestConfig) {
    this.config = config;
  }
  /**
   * Run all validation checks on the config.
   */
  validate(): boolean {
    Log.info("Validating Config...");
    this.checkRequiredFields();
    this.checkTestDirectory();
    this.checkFilePattern();
    this.checkExcludePattern();
    this.checkLogicalConsistency();
    this.checkValidFilePatterns();
    this.checkValidExcludePatterns();
    this.checkTestDirectoryExisting();
    Log.info("Config validation completed. Looks good.");

    if (this.errors.length > 0) {
      this.logErrors();
      return false; // Validation failed
    }
    return true; // Validation passed
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
    const requiredFields: (keyof TestConfig)[] = [
      "filePattern",
    ];
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
