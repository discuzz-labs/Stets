/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as path from "path";
import * as fs from "fs";
import config from "../stets.config";
import { Log } from "../utils/Log";
import { ArgsParser } from "../cli/ArgParser";

///types
export type TestConfig = {
  testDirectory: string;
  pattern: string | string[];
  exclude: string | string[];
  //reporters
  reporters: ("html" | "json" | "spec" | "md" | "xml" | "csv")[];
  outputDir: string;

  env: string[];
};

export type StetsConfig = Partial<TestConfig>;
///

export class Config {
  private config: TestConfig = config;
  private loadedConfig: StetsConfig = {}; // Store loaded config from file
  private configFileName: string = path.join(process.cwd(), this.args.get("config") as string || "stets.config.ts");

  // Private constructor to prevent external instantiation
  constructor(private args: ArgsParser) {
    this.loadConfigFromFile();
    this.setConfig();
  }

  // Method to load configuration from the available config file
  private loadConfigFromFile(): void {
    if (fs.existsSync(this.configFileName)) {
      try {
        const loadedConfig: StetsConfig = require(this.configFileName).default;
        this.loadedConfig = loadedConfig;
        Log.info(`Loaded config from ${this.configFileName}`);
        return;
      } catch (error: any) {
        Log.error(`Failed to load config from ${this.configFileName}: ${error.message}`);
      }
    } else {
      Log.info("No configuration files were found.");
      Log.warn(`Config file ${this.configFileName} not found.`);
    }
  }

  // Dynamically set the configuration by merging default, file-based, and CLI options
  private setConfig() {
    this.config = {
      ...this.config,
      ...this.loadedConfig,
    };
  }

  // Method to get a specific config value with the correct inferred type
  public get<K extends keyof TestConfig>(key: K): TestConfig[K] {
    return this.config[key];
  }
}
