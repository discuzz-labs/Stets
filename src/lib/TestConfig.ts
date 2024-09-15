/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Command } from 'commander';

export class TestConfig {
  private static instance: TestConfig | null = null;
  private defaultConfig = {
    verbose: false,
    bail: false,
    timeout: 5000,
    testDirectory: 'tests',
    filePattern: '**/*.test.ts',
    color: true,
  };

  private resolvedConfig: any = {};

  private constructor(private commander: Command) {
    this.resolvedConfig = this.resolveConfig();
  }

  /**
   * Returns the singleton instance of TestConfig, initializing it if necessary.
   * @param commander - The Commander instance for CLI options.
   */
  static getInstance(commander: Command): TestConfig {
    if (!TestConfig.instance) {
      TestConfig.instance = new TestConfig(commander);
    }
    return TestConfig.instance;
  }

  /**
   * Resolves the configuration by merging default settings with command-line options.
   * @returns {any} Resolved configuration object.
   */
  private resolveConfig(): any {
    const options = this.mapOptionsToConfig();
    return { ...this.defaultConfig, ...options };
  }

  /**
   * Maps command-line options to the config object.
   * @returns {object} Mapped configuration object.
   */
  private mapOptionsToConfig(): object {
    const options = this.commander.opts();
    return {
      verbose: options.verbose || this.defaultConfig.verbose,
      bail: options.bail || this.defaultConfig.bail,
      timeout: options.timeout || this.defaultConfig.timeout,
      testDirectory: options.testDirectory || this.defaultConfig.testDirectory,
      filePattern: options.filePattern || this.defaultConfig.filePattern,
      color: options.color !== undefined ? options.color : this.defaultConfig.color,
    };
  }

  /**
   * Retrieves the resolved configuration.
   * @returns The resolved configuration object.
   */
  getConfig(): any {
    return this.resolvedConfig;
  }
}