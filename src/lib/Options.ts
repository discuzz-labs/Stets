/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { CLIOptions, ConfigOptions } from "../types";
import config from "../stets.config";

export class Options {
  options: Partial<CLIOptions> = {}; // Initialize as a partial type to avoid unassigned keys
  static envPrefix: string = "STETS_";

  // Centralized configuration for all options with details
  static optionConfig: Record<
    keyof CLIOptions | ConfigOptions,
    { requiresValue: boolean }
  > = {
    config: { requiresValue: true },
    logLevel: { requiresValue: true },
    verbose: { requiresValue: false },
    // Dynamically add config keys and set requiresValue as true
    ...(Object.fromEntries(
      Object.keys(config).map((key) => [
        key as ConfigOptions,
        { requiresValue: true },
      ]),
    ) as Record<ConfigOptions, { requiresValue: boolean }>),
  };

  constructor(args: string[]) {
    this.parseArgs(args);
    this.setToEnv();
  }

  private setToEnv(): void {
    Object.keys(this.options).forEach((key) => {
      const envKey = `${Options.envPrefix}${key.toUpperCase()}`;
      const value = this.options[key as keyof CLIOptions];
      process.env[envKey] = String(value);
      Log.info(`Setting ${envKey}=${value}`);
    });
  }

  private parseArgs(args: string[]) {
    args.forEach((arg) => {
      if (arg.includes("=")) {
        const [key, value] = arg.split("=");
        const flagKey = this.normalizeFlag(key);

        // Ensure the key is valid and accepted in `CLIOptions`
        if (flagKey && value && flagKey in Options.optionConfig) {
          this.options[flagKey] = value as any; // Safely assign string value to the options.
        } else {
          console.warn(`Unknown or unsupported option: ${key}`);
          process.exit(1);
        }
      } else {
        const flagKey = this.normalizeFlag(arg);

        if (flagKey && flagKey in Options.optionConfig) {
          // Check if this option requires a value or can be a flag
          if (Options.optionConfig[flagKey].requiresValue) {
            console.error(`Option ${arg} requires a value. Use ${arg}=value.`);
            process.exit(1);
          }
          this.options[flagKey] = true as any; // Assign boolean `true` for flags.
        } else {
          console.warn(`Unknown flag: ${arg}`);
          process.exit(1);
        }
      }
    });
  }

  private normalizeFlag(flag: string): keyof CLIOptions | ConfigOptions | null {
    const normalizedFlag = flag.startsWith("--")
      ? flag.slice(2)
      : flag.startsWith("-")
        ? flag.slice(1)
        : flag;

    return normalizedFlag as keyof CLIOptions | ConfigOptions;
  }

  getOptions() {
    return this.options;
  }

  // Static method to check if an option exists in process.env
  static hasOption(option: keyof CLIOptions | ConfigOptions): boolean {
    return process.env.hasOwnProperty(
      `${Options.envPrefix}${option.toUpperCase()}`,
    );
  }

  // Static method to get an option from process.env
  static getOption(
    option: keyof CLIOptions | ConfigOptions,
  ): string | undefined {
    return process.env[`${Options.envPrefix}${option.toUpperCase()}`];
  }
}
