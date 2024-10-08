/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteReporter } from "../lib/SuiteReporter";
import { SuiteRunner } from "../lib/SuiteRunner";
import { Log } from "../utils/Log";

const defaultCmd = async () => {
  Log.info("Running default command")
  const runner = new SuiteRunner();
  const reporter = new SuiteReporter();
  
  await runner.init()
  await runner.runSuites()
  reporter.reportSuites(runner.suiteCases)
  
  Log.info("Default Command finished")
};

export default defaultCmd;