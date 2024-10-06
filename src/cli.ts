/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import defaultCmd from "./commands/default.cmd";
import { version, name, description} from "../package.json";
import { Log } from "./utils/Log"
import { Options } from "./lib/Options"

class CLI {
  constructor() {
    new Options(process.argv.slice(2));
    this.run();
  }

  private printVersion(){
    console.log(`Version: ${version}`)
  }
  private printHelp() {
    console.log(`
${name}  ${description}
Usage: <command> [options]

Options:
  --version             Print the version number
  -v, --verbose         Enable verbose mode
  -h, --help            Display this help message
  -l, logLevel=<level>  Set log level (error, warning, success, info)
  -t, --testDirectory=<directory>  Set the test directory`);
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

    defaultCmd();
  }
}

// Instantiate and run the CLI
new CLI();