/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import defaultCmd from "./commands/default.cmd";
import { version, name, description } from "../package.json";
import { Log } from "./utils/Log";
import { Options } from "./config/Options";
import { OptionsConfig } from "./config/OptionsConfig";

class CLI {
  constructor() {
    OptionsConfig.generateShortOptions();
    this.run();
  }

  private printVersion() {
    console.log(`Version: ${version}`);
  }

  private printHelp() {
    const options = OptionsConfig.get(); // Get the options configuration

    // Constructing the help message
    const optionsHelp = Object.entries(options)
      .map(([key, { requiresValue, shortValue }]) => {
        const optionNames = [
          shortValue ? "-" + shortValue + "," : "",
          "--" + key,
        ]
          .filter(Boolean)
          .join(" "); // Construct the option name string
        const valueDescription = requiresValue ? "=<value>" : ""; // Determine if a value is required
        return "\t" + optionNames + "\t" + valueDescription; // Use \t for indentation
      })
      .join("\n"); // Join all options for display

    console.log(
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

  private run() {
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

    new Options(process.argv.slice(2));

    defaultCmd();
  }
}

// Instantiate and run the CLI
new CLI();
