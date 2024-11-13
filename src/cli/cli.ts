/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { version, name, description } from "../../package.json";
import { ArgsParser } from "../cli/ArgParser.js";
import { Config } from "../config/Config.js";
import { Env } from "../core/Env.js";
import { TestsPool } from "../core/TestsPool.js";
import { Glob } from "../glob/Glob.js";
import COMMANDS from "./commands.js";

(async () => {
  const args = new ArgsParser();
  const config = new Config(args.get("config"));
  
  const exclude = args.get("exclude") || config.get("exclude");
  const pattern = args.get("pattern") || config.get("pattern");
  const envs = args.get("envs") || config.get("envs");
  const files = args.get("file");

  new Env(envs).load()

  const testFiles = await new Glob({ files, exclude, pattern }).collect();
  await new TestsPool(testFiles).runTests();

  process.exit();
})();
