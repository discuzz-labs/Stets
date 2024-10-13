/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Config } from "../config/Config";
import { File } from "./File";
import fs from "fs";
import path from "path";
import { Log } from "./Log";

export class TsConfig {
  static get(): string {
    const config = Config.getInstance();
    const ignoreDefault = config.getConfig("ignoreDefault");
    const ignoreDiscovered = config.getConfig("ignoreDiscovered");
    
    let defaultTsconfigRaw = "";
    let discoveredTsconfigRaw = "";

    // Read the default tsconfig.json if ignoreDefault is false
    if (!ignoreDefault) {
      const defaultTsconfigPath = config.getConfig("tsconfig");
      defaultTsconfigRaw = new File(defaultTsconfigPath).readFile()!;
      if (!defaultTsconfigRaw) {
        console.error(
          "Error while loading default tsconfig, run with -v to see why",
        );
        process.exit(1);
      }
    }

    // Discover tsconfig.json in current or parent directories if ignoreDiscovered is false
    if (!ignoreDiscovered) {
      const discoveredTsconfigPath = this.findTsConfig();
      if (discoveredTsconfigPath) {
        let discoveredTsconfigContent = new File(
          discoveredTsconfigPath,
        ).readFile();
        if (!discoveredTsconfigContent) {
          console.error(
            `Error while loading discovered tsconfig at ${discoveredTsconfigPath}`,
          );
          process.exit(1);
        }
        discoveredTsconfigRaw = discoveredTsconfigContent;
      }
    }

    // Merge the configurations if neither config is ignored
    let mergedConfig = {};

    if (defaultTsconfigRaw || discoveredTsconfigRaw) {
      mergedConfig = this.mergeConfigs(
        defaultTsconfigRaw ? JSON.parse(defaultTsconfigRaw) : {},
        discoveredTsconfigRaw ? JSON.parse(discoveredTsconfigRaw) : {},
      );
    }

    // Log the merged result
    Log.info("All configurations merged successfully:");
    Log.info(JSON.stringify(mergedConfig, null, 2));

    return JSON.stringify(mergedConfig);
  }

  private static findTsConfig(): string | null {
    let currentDir = process.cwd();

    while (currentDir) {
      const tsconfigPath = path.join(currentDir, "tsconfig.json");
      if (fs.existsSync(tsconfigPath)) {
        console.log(`Discovered tsconfig.json at: ${tsconfigPath}`);
        return tsconfigPath;
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir; // Move up to the parent directory
    }

    console.log("No tsconfig.json found.");
    return null;
  }

  private static mergeConfigs(defaultConfig: any, discoveredConfig: any): any {
    return { ...defaultConfig, ...discoveredConfig }; // Simple shallow merge; customize if needed
  }
}
