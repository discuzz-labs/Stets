/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Reporter } from "../../core/Reporter";
import { Config } from "../../config/Config";
import { TestFiles } from "../../core/TestFiles";
import { TestsRunner } from "../../core/TestsRunner";
import { Log } from "../../utils/Log";

const run = async () => {
  Log.info("Running default command")
  const config = Config.init()

  const testFiles = new TestFiles()
  await testFiles.load()
  const runner = new TestsRunner(testFiles.get());
  await runner.runFiles()

  Reporter.reportSummary()
  
  Log.info("Default Command finished")
};

export default run;