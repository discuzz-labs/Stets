/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestRunner } from "../lib/TestRunner";


const defaultCmd = async () => {
  const runner = new TestRunner();
  await runner.loadTests();
  return await runner.runTests();
};

export default defaultCmd;