/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Log } from "../utils/Log";
import { TestFile } from "../types";
import type { Config } from "../config/Config";
import { Glob } from "./Glob";
import type { ArgsParser } from "../cli/ArgParser";
import path from "path";
import dotenv from "dotenv";

export class TestFiles {
  private testFiles: TestFile[] = [];

  constructor(
    private args: ArgsParser,
    private config: Config,
  ) {}

  /**
   * Loads all test files by dynamically importing them and initializes Suite instances.
   */
  async load(): Promise<void> {
    try {
      const testDirectory: string =
        this.args.get("testDirectory") ?? this.config.get("testDirectory");
      const pattern: string | string[] =
        this.args.get("pattern") ?? this.config.get("pattern");
      const maxTestFiles: number | undefined = this.args.get("maxTestFiles");
      const excludePattern: string | string[] = this.config.get("exclude");
      const passedFiles: string[] | undefined =
        this.args.get("file") ?? undefined;

      Log.info(`Tests directory: ${testDirectory}`);
      Log.info(`Using file patterns: ${pattern}`);
      Log.info(`Excluding patterns: ${excludePattern}`);

      // Use Glob to find test files
      const glob = new Glob({
        excludePattern,
        pattern,
        maxTestFiles,
        testDirectory,
      });

      // Now, pass the directory and file patterns to Glob
      const files =
        passedFiles?.map((file) => path.resolve(file)) ??
        (await glob.collect());
      if (files.length === 0) {
        Log.error("No test files were found.");
        console.log(
          `No suites were found applying the following pattern(s): ${pattern} in the directory: ${testDirectory ? testDirectory : process.cwd()} \n`,
        );
        process.exit(1);
      }

      this.testFiles = files.map((testFile) => ({
        path: testFile,
      }));

      const envFiles =
        this.args
          .get("env")
          ?.map((file) => path.join(process.cwd(), testDirectory, file)) ??
        this.config
          .get("env")
          .map((file) => path.join(process.cwd(), testDirectory, file));

      Log.info(`Loading env files: ${envFiles}`);

      dotenv.config({
        path: envFiles,
      });

      Log.info(`Found test files: ${files.join(", ")}`);
    } catch (error: any) {
      console.error(`Failed to load files: ${error}`);
      process.exit(1);
    }
  }

  get() {
    return this.testFiles;
  }
}
