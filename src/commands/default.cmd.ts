/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Config } from "../lib/Config";
import { Reporter } from "../lib/Reporter";
import { SuitesRunner } from "../lib/SuitesRunner";
import { Log } from "../utils/Log";

const defaultCmd = async () => {
  Log.info("Running default command")
  const config = Config.getInstance()
  
  const runner = new SuitesRunner();
  const reporter = new Reporter();
  
  await runner.init()
  await runner.runSuites()
  if(config.getConfig("clearConsole")) console.clear()
  reporter.reportSuites(runner.suiteCases)
  
  Log.info("Default Command finished")
};

export default defaultCmd;