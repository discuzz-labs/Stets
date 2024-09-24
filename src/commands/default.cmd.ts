/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteRunner } from "../lib/SuiteRunner";

const defaultCmd = async () => {
  const runner = new SuiteRunner();
  await runner.loadSuites();
  return await runner.runSuites();
};

export default defaultCmd;