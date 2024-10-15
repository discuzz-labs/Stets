/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Config } from "../../config/Config";
import { TestFiles } from "../../core/TestFiles";
import { TestsRunner } from "../../core/TestsRunner";
import { Log } from "../../utils/Log";

const run = async () => {
  Log.info("Running default command")
  const config = Config.init()

  const testFiles = new TestFiles()
  testFiles.load()
  const runner = new TestsRunner(testFiles.get());
  await runner.runFiles()
  //const reporter = new Reporter(runner.get());
  
  if(config.get("clearConsole").toString() === "true") console.clear()
  
  //reporter.reportSuites()
  
  Log.info("Default Command finished")
};

export default run;