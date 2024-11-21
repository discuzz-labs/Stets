/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { version } from "./commands.js";
import { ArgsParser } from "../cli/ArgParser.js";
import { Config } from "../config/Config.js";
import { Env } from "../core/Env.js";
import { Pool } from "../core/Pool.js";
import { Glob } from "../glob/Glob.js";
import { help} from "./commands.js";
import { Reporter } from "../reporters/Reporter.js";

(async () => {
  const args = new ArgsParser();
  const config = await new Config().load(args.get("config"))

  if(args.get("help")) {
    console.log(help())
    return 
  }

  if(args.get("version")) {
    console.log(version())
    return 
  }
  
  const exclude = args.get("exclude") || config.get("exclude");
  const pattern = args.get("pattern") || config.get("pattern");
  const envs = args.get("envs") || config.get("envs");
  const timeout = args.get("timeout") || config.get("timeout");
  const plugins = config.get("plugins")
  const files = args.get("file");
  const context = config.get("context")
  const tsconfig = config.get("tsconfig")
  
  new Env(envs).load();
  new Reporter(["all"])

  const testFiles = await new Glob({ files, exclude, pattern }).collect();
  const pool = new Pool({
    testFiles,
    context,
    plugins,
    tsconfig,
    timeout: parseInt(timeout as unknown as string),
  });

  const exitCode = await pool.run();
  pool.report()

  process.exit(exitCode);
})();
