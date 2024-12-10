/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import { version } from './commands.js';
import { ArgsParser } from '../cli/ArgParser.js';
import { Config } from '../config/Config.js';
import { Env } from '../core/Env.js';
import { Glob } from '../glob/Glob.js';
import { help } from './commands.js';
import { Start } from '../core/Start.js';
import 'esbuild-register';
import { isValidConfig } from '../config/isValidConfig.js';

(async () => {
  const args = new ArgsParser();
  const config = await new Config().load(args.get('config'));

  // Handle various CLI commands
  if (args.get('help')) {
    console.log(help());
    return;
  }

  if (args.get('version')) {
    console.log(version());
    return;
  }

  // Validate and load configuration
  const exclude = args.get('exclude') || config.get('exclude');
  const pattern = args.get('pattern') || config.get('pattern');
  const envs = args.get('envs') || config.get('envs');
  const timeout = args.get('timeout') || config.get('timeout');
  const plugins = config.get('plugins');
  const files = args.get('file');
  const context = config.get('context');
  const tsconfig = config.get('tsconfig');
  const watch = args.get('watch') || config.get('watch');
  const requires = config.get("require") || args.get("require")
  const output = config.get("output")
  const reporters = config.get("reporters")

  // Validate configuration
    isValidConfig({
      exclude,
      pattern,
      envs,
      timeout,
      plugins,
      files,
      context,
      tsconfig,
      reporters,
    });
  

  // Load environment variables
  new Env(envs).load();

  // Collect test files
  const testfiles = await new Glob({ files, exclude, pattern }).collect();

  // Create and run test runner
  await new Start({
    watch,
    config,
    files: testfiles,
    pattern,
    exclude,
    requires,
    reporters
  }).start();
})();
