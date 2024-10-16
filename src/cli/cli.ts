/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import run from "./commands/run";
import { version, name, description } from "../../package.json";
import { Log } from "../utils/Log";
import { ArgsParser } from "../cli/ArgParser";
import COMMANDS from "../constants/commands";

class CLI {
  constructor() {
    this.init();
  }

  private printVersion() {
    console.info(`Version: ${version}`);
  }

  private printHelp() {
    // Constructing the help message
    const optionsHelp = Object.entries(COMMANDS)
      .map(([key, { shortValue, requiresValue, description }]) => {
        const optionNames = [
          shortValue ? "-" + shortValue + "," : "",
          "--" + key,
        ]
          .filter(Boolean)
          .join(" "); // Construct the option name string

        const valueDescription = requiresValue ? "=<value>" : ""; // Determine if a value is required

        return (
          "\t" + optionNames + "\t" + valueDescription + "\t" + description
        ); // Use \t for indentation
      })
      .join("\n"); // Join all options for display

    process.stdout.write(
      name +
        "  " +
        description +
        "\n" +
        "Usage: <command> [options]\n\n" +
        "Options:\n" +
        "\t--version\n" +
        "\t-v, --verbose\n" +
        "\t-h, --help\n" +
        optionsHelp,
    );
  }

  private init() {
    Log.info("CLI Running");

    if (process.argv.includes("--help") || process.argv.includes("-h")) {
      this.printHelp();
      return;
    }

    // Handle --version
    if (process.argv.includes("--version")) {
      this.printVersion();
      return;
    }

    new ArgsParser();

    run();
  }
}


// Instantiate and run the CLI
new CLI();