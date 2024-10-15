/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { SuiteCase } from "../types";
import { Log } from "../utils/Log";
import { SpecReporter } from "../reporters/SpecReporter";
import { SuiteRunner } from "./SuiteRunner";

export class SuitesRunner {
  constructor(private suiteCases: SuiteCase[]){}

  get() {
    return this.suiteCases
  }
  
  async runSuites() {
    Log.info("Loading test suites...");
    Log.info(`${this.suiteCases.length} test suites loaded.`);

    // Execute all suites
    await Promise.all(
      this.suiteCases.map(async (suiteCase) => {
        Log.info(`Running suite: ${suiteCase.path}`);
        SpecReporter.onSuiteStart({
          path: suiteCase.path,
          description: suiteCase.path
        });
        const suiteStartTime = Date.now(); // Start tracking suite duration
        await new SuiteRunner(suiteCase.path).runSuite()
        const suiteEndTime = Date.now(); // End tracking suite duration
        // Calculate and set the duration for the whole suite
        suiteCase.duration = suiteEndTime - suiteStartTime;
      }),
    );
  }
}
