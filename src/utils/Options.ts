/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { CLIOptions } from "../types";

export class Options {
  options: CLIOptions = {};
  static envPrefix: string = "STETS_"
  
  constructor(args: string[]) {
    this.parseArgs(args);
    this.setToEnv()
  }

  private setToEnv(): void {
    Object.keys(this.options).forEach((key) => {
      const envKey = `${Options.envPrefix}${key.toUpperCase()}`;
      const value = (this.options as any)[key];
      process.env[envKey] = String(value);
      Log.info(`Setting ${Options.envPrefix}${key.toUpperCase()}=${value}`);
    });
  }

  private parseArgs(args: string[]) {
    args.forEach((arg) => {
      // Handle key=value pairs like logLevel=error
      if (arg.includes("=")) {
        const [key, value] = arg.split("=");
        // Ensure both key and value exist
        if (key && value) {
          switch (key) {
            case "-l":
            case "--logLevel":
              this.options.logLevel = value;
              break;
            case "-t":
            case "--testDirectory":
              this.options.testDirectory = value;
              break;
            default:
              console.warn(`Unknown option: ${key}`);
              break;
          }
        } else {
          console.warn(`Invalid argument format: ${arg}`);
        }
      } else {
        // Handle flags like --verbose or -v
        switch (arg) {
          case "-v":
          case "--verbose":
            this.options.verbose = true;
            break;
          default:
            console.warn(`Unknown flag: ${arg}`);
            break;
        }
      }
    });
  }

  getOptions() {
    return this.options;
  }

  // Static method to check if an option exists in process.env
  static hasOption(option: string): boolean {
    return process.env.hasOwnProperty(
      `${Options.envPrefix}${option.toUpperCase()}`,
    );
  }

  // Static method to get an option from process.env
  static getOption(option: keyof CLIOptions): string | undefined {
    return process.env[`${Options.envPrefix}${option.toUpperCase()}`];
  }
}
