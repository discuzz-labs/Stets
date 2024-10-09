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
  // Map to store short options corresponding to each long option
  private shortOptionMap: Record<string, string> = {};
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
        { requiresValue: typeof config[key as ConfigOptions] !== "boolean" },
      ]),
    ) as Record<ConfigOptions, { requiresValue: boolean }>),
  };

  constructor(args: string[]) {
    this.generateShortOptions();
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
  /**
   * Generates unique short options for all CLIOptions and ConfigOptions.
   * The short options are based on the first letter, and disambiguated using subsequent letters.
   */
  private generateShortOptions(): void {
    const optionKeys = Object.keys(Options.optionConfig);
    const takenShortOptions = new Set<string>();

    optionKeys.forEach((option) => {
      let shortOption = option[0]; // Start with the first letter
      let index = 1;

      // If the first letter is taken, continue to use the next available unique letter
      while (takenShortOptions.has(shortOption)) {
        shortOption = option.slice(0, index + 1); // Incrementally take more letters
        index++;
      }

      this.shortOptionMap[shortOption] = option; // Map the short option to the long option
      takenShortOptions.add(shortOption); // Mark this short option as taken
    });
  }

  private normalizeFlag(flag: string): keyof CLIOptions | ConfigOptions | null {
    const normalizedFlag = flag.startsWith("--")
      ? flag.slice(2)
      : flag.startsWith("-")
        ? flag.slice(1)
        : flag;

    // Check if the normalized flag is a short option first
    if (this.shortOptionMap[normalizedFlag]) {
      return this.shortOptionMap[normalizedFlag] as
        | keyof CLIOptions
        | ConfigOptions;
    }

    // Otherwise, treat it as a long option
    return normalizedFlag as keyof CLIOptions | ConfigOptions;
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
