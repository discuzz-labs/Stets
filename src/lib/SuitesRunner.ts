/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteCase } from "../types";
import { Log } from "../utils/Log";
import { SpecReporter } from "../reporters/SpecReporter";
import { SuitesLoader } from "./SuitesLoader";
import { SuiteRunner } from "./SuiteRunner";

export class SuitesRunner {
  suiteCases: SuiteCase[] = [];

  async init() {
    let suiteLoader = new SuitesLoader();
    await suiteLoader.loadSuites();
    this.suiteCases = suiteLoader.getSuites();
  }

  async runSuites() {
    Log.info("Loading test suites...");
    Log.info(`${this.suiteCases.length} test suites loaded.`);

    // Execute all suites
    await Promise.all(
      this.suiteCases.map(async (suiteCase) => {
        Log.info(`Running suite: ${suiteCase.suite.description}`);
        SpecReporter.onSuiteStart(suiteCase.suite.description);
        const suiteStartTime = Date.now(); // Start tracking suite duration
        const executor = new SuiteRunner();
        await executor.runSuiteInProcess(suiteCase); // Use the new SuiteExecutor class
        const suiteEndTime = Date.now(); // End tracking suite duration
        // Calculate and set the duration for the whole suite
        suiteCase.duration = suiteEndTime - suiteStartTime;
      }),
    );
  }
}
