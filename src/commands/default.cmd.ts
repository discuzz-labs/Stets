/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteRunner } from "../lib/SuiteRunner";
import { Log } from "../utils/Log";

const defaultCmd = async () => {
  Log.info("Running default command")
  const runner = new SuiteRunner();
  await runner.runSuites();
  Log.info("Default Command finished")
};

export default defaultCmd;