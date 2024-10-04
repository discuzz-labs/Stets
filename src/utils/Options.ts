/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { CLIOptions } from "../types";
import config from "../stets.config";

export class Options {
  options: CLIOptions = {}; // Initialize as an empty object to store parsed options.
  static envPrefix: string = "STETS_";
  static acceptedOptions: Array<keyof CLIOptions> = ["logLevel", "verbose", ...Object.keys(config) as (keyof CLIOptions)[]]; // Dynamically append keys from config.

  constructor(args: string[]) {
    this.parseArgs(args);
    this.setToEnv();
  }

  private setToEnv(): void {
    Object.keys(this.options).forEach((key) => {
      const envKey = `${Options.envPrefix}${key.toUpperCase()}`;
      const value = (this.options as any)[key];
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
        if (flagKey && value && Options.acceptedOptions.includes(flagKey)) {
          this.options[flagKey] = value as any; // Safely assign string value to the options.
        } else {
          console.warn(`Unknown or unsupported option: ${key}`);
        }
      } else {
        const flagKey = this.normalizeFlag(arg);

        if (flagKey && Options.acceptedOptions.includes(flagKey)) {
          this.options[flagKey] = true as any; // Assign boolean `true` for flags without values.
        } else {
          console.warn(`Unknown flag: ${arg}`);
        }
      }
    });
  }

  private normalizeFlag(flag: string): keyof CLIOptions | null {
    const normalizedFlag = flag.startsWith("--")
      ? flag.slice(2)
      : flag.startsWith("-")
      ? flag.slice(1)
      : flag;

    // Ensure that the normalized flag is one of the accepted options.
    return normalizedFlag as keyof CLIOptions;
  }

  getOptions() {
    return this.options;
  }

  // Static method to check if an option exists in process.env
  static hasOption(option: keyof CLIOptions): boolean {
    return process.env.hasOwnProperty(`${Options.envPrefix}${option.toUpperCase()}`);
  }

  // Static method to get an option from process.env
  static getOption(option: keyof CLIOptions): string | undefined {
    return process.env[`${Options.envPrefix}${option.toUpperCase()}`];
  }
}
