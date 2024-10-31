/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { version, name, description } from "../../package.json";
import { ArgsParser } from "../cli/ArgParser";
import { Reporter } from "../reporters/Reporter";
import { Config } from "../config/Config";
import { Glob } from "../glob/Glob";
import { init } from "@veve/core"
import COMMANDS from "./commands";

(async () => {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.info(
      `${name}  ${description}\nUsage: <command> [options]\n\nOptions:\n\t--version\n` +
        Object.entries(COMMANDS)
          .map(
            ([key, { shortValue, requiresValue, description }]) =>
              `\t${shortValue ? `-${shortValue},` : ""}--${key} ${requiresValue ? "=<value>" : ""}\t${description}`,
          )
          .join("\n"),
    );
    return;
  }

  if (process.argv.includes("--version")) {
    console.info(`Version: ${version}`);
    return;
  }

  const args = new ArgsParser();
  const config = new Config(args.get("config"));
  init()
  
  const exclude = args.get("exclude") || config.get("exclude")
  const pattern = args.get("pattern") || config.get("pattern")
  const files = args.get("file") 

  init()
  
  const testFiles = await new Glob(files, exclude, pattern).collect();
  
  
  Reporter.reportSummary();
  
  process.exit();
})();
