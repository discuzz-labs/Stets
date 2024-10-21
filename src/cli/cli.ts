/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { version, name, description } from "../../package.json";
import { Log } from "../utils/Log";
import { ArgsParser } from "../cli/ArgParser";
import COMMANDS from "../constants/commands";
import { Reporter } from "../core/Reporter";
import { TestFiles } from "../core/TestFiles";
import { TestsRunner } from "../core/TestsRunner";
import { Config } from "../config/Config";

class CLI {
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

  async init() {
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

    const args = new ArgsParser();
    const config = new Config(args)
    new Log(args.get("logLevel"), args.get("verbose"))
    
    const testFiles = new TestFiles(args, config)
    await testFiles.load()
    const runner = new TestsRunner(testFiles.get());
    await runner.runFiles()

    Reporter.reportSummary()
  }
}

// Instantiate and run the CLI
new CLI().init()