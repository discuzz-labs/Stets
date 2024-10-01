/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as path from "path";
import * as fs from "fs";
import config from "../stets.config";
import { StetsConfig, TestConfig } from "../types";
import { Log } from "../utils/Log";

export class Config {
  private static instance: Config;
  private config: TestConfig = config;
  configFileName: string[] = [
    path.join(process.cwd(), "stets.config.ts"),
    path.join(process.cwd(), "stets.config.js"),
  ];
  [key: string] : any;
  
  // Private constructor to prevent external instantiation
  private constructor() {
    this.loadConfig();
    this.mapConfigValues();
  }

  // Static method to provide a global access point to the singleton instance
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  // Method to load configuration from the available config file
  private loadConfig(): void {
    for (const filePath of this.configFileName) {
      if (fs.existsSync(filePath)) {
        try {
          const loadedConfig: StetsConfig = require(filePath).default;
          this.config = { ...this.config, ...loadedConfig }; // Merge with defaults
          Log.info(`Using these config values: ${this.config}`)
          return;
        } catch (error: any) {
          Log.error(`Failed to load config from ${filePath}: ${error}`)
        }
      } else {
        Log.warning(`Config file ${filePath} not found.`)
      }
    }
  }

  // Map config values to instance properties
  private mapConfigValues(): void {
    Object.keys(this.config).forEach((key) => {
       this[key] = (this.config as any)[key]; 
    });
  }
}
