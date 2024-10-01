/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { log } from "console";
import { CLIOptions } from "../types";
import { Env } from "../utils/Env";

export class Options {
  private options: CLIOptions = {};

  constructor(args: string[]) {
    this.parseArgs(args);
    Env.setFromOptions(this.options);
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
      `${Env.envPrefix}${option.toUpperCase()}`,
    );
  }

  // Static method to get an option from process.env
  static getOption(option: keyof CLIOptions): string | undefined {
    return process.env[`${Env.envPrefix}${option.toUpperCase()}`];
  }
}
