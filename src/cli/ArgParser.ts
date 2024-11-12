/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import COMMANDS from "./commands";

////types
export type CLIOptions = {
  config?: string;
  file?: string[];
  
  pattern?: string[];
  exclude?: string[];
  envs?: string[];
};
////

export class ArgsParser {
  options: CLIOptions = {};

  constructor() {
    this.parseArgs(process.argv.slice(2));
  }

  /**
   * Parse command-line arguments and populate options.
   */
  private parseArgs(args: string[]): void {
    let currentOption: keyof CLIOptions | null = null;

    args.forEach((arg) => {
      let flagKey: keyof CLIOptions | null;
      let value: string | boolean = true; // Default value for flags without `=`

      // Handle key=value pairs and flags
      if (arg.includes("=")) {
        const [key, val] = arg.split("=");
        flagKey = this.normalizeFlag(key);
        value = val; // Assign the value from the argument
        currentOption = null; // Reset current option after a key=value pair
      } else if (arg.startsWith("-")) {
        // It's a flag, so normalize it
        flagKey = this.normalizeFlag(arg);
        currentOption = flagKey;
      } else if (currentOption) {
        // This handles positional values that follow a flag, e.g., -f opt1 opt2
        flagKey = currentOption;
        value = arg;
      } else {
        flagKey = this.normalizeFlag(arg);
      }

      // Validate the flag and assign value/flag appropriately
      if (flagKey && flagKey in COMMANDS) {
        const commandConfig = COMMANDS[flagKey];

        if (commandConfig.requiresValue && value === true) {
          console.error(`Option ${arg} requires a value. Use ${arg}=value.`);
          process.exit(1);
        }

        // If the command expects an array of values, collect multiple values
        if (commandConfig.isArray) {
          // Ensure it's an array and then push the new value
          const arrayValue = (this.options[flagKey] as string[]) || [];
          arrayValue.push(value as string);
          this.options[flagKey] = arrayValue as any;
        } else {
          this.options[flagKey] = value as any;
        }

      } else if (flagKey) {
        console.warn(`Unknown or unsupported option: ${arg}`);
        process.exit(1);
      }
    });
  }

  /**
   * Normalize the flag, checking both long (--flag) and short (-f) options.
   */
  private normalizeFlag(flag: string): keyof CLIOptions | null {
    // Remove "--" for long options and "-" for short options
    const normalizedFlag = flag.startsWith("--")
      ? flag.slice(2) // For long options: --flag => flag
      : flag.startsWith("-")
        ? this.getLongOptionFromShort(flag.slice(1)) // For short options: -f => corresponding long option
        : flag; // If no prefix, treat it as-is

    // Check if it's a valid long or short option in the commandConfig
    if (COMMANDS.hasOwnProperty(normalizedFlag as string)) {
      return normalizedFlag as keyof CLIOptions;
    }

    return null; // Return null if the flag is not recognized
  }

  /**
   * Get the corresponding long option from a short flag.
   */
  private getLongOptionFromShort(shortFlag: string): string | null {
    for (const [key, config] of Object.entries(COMMANDS)) {
      if (config.shortValue === shortFlag) {
        return key; // Return the long option if the short flag matches
      }
    }
    return null; // Return null if no matching short flag is found
  }

  /**
   * Check if an option exists.
   */
  has(option: keyof CLIOptions): boolean {
    return this.options.hasOwnProperty(option);
  }

  /**
   * Get an option value.
   */
  public get<K extends keyof CLIOptions>(key: K): CLIOptions[K] {
    return this.options[key];
  }
}

