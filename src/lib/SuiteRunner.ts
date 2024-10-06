/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Reporter } from "../lib/Reporter";
import execShellCommand from "../utils/execShellCommand";
import { Suite } from "../types";
import { Log } from "../utils/Log";
import { SuiteLoader } from "./SuiteLoader";

export class SuiteRunner {
  private startTime: number = 0;
  private endTime: number = 0;

  constructor() {}

  /**
   * Runs all loaded suites in parallel and logs the results.
   */
  /**
   * Runs all loaded suites in parallel and logs the results.
   */
  async runSuites() {
    let suiteLoader = new SuiteLoader()
    await suiteLoader.loadSuites()
    let suites = suiteLoader.getSuites()
    
    this.startTimer(); // Start the timer

    await Promise.all(
      suites.map(async (suite) => await this.runSuite(suite)),
    );

    // Clear console for feedback
    console.clear();
    
    suites.forEach((suite) => {
      this.divider(suite.path);
      console.log(suite.stdout);
    });

    const failed = suites.filter(
      (suite) => suite.status === "failed",
    ).length;

    this.stopTimer(); // Stop the timer
    const duration = this.getDuration(); // Calculate the total duration

    console.log(
      Reporter.onSummary({
        total: suites.length,
        failed,
        duration, // Pass the duration here
      }),
    );

    process.exit(failed > 0 ? 1 : 0);
  }

  /**
   * Runs a single suite and updates its status based on the result.
   * @param suite {Suite} - The suite instance to run.
   */
  private async runSuite(suite: Suite) {
    console.log(Reporter.onSuiteStart(suite.path)); // Reporter test start
    try {
      const stdout = await execShellCommand(["tsx", suite.path]);
      suite.stdout = stdout;
    } catch (error: any) {
      Log.error(`Error running suite file: ${suite.path} due to ${error}`);
      suite.stdout = error;
    }
  }

  private startTimer(): void {
    this.startTime = Date.now();
  }

  private stopTimer(): void {
    this.endTime = Date.now();
  }

  private getDuration(): number {
    return this.endTime - this.startTime;
  }

  private divider(suitePath: string) {
    const terminalWidth = process.stdout.columns || 80; // Default to 80 if columns are not available
    const maxDividerLength = Math.floor(terminalWidth / 2); // Limit to 50% of terminal width

    // Define a fixed length for the divider
    const fixedDividerLength = Math.min(maxDividerLength, 80); // You can adjust 80 as needed

    // Truncate the suite path if it's too long
    const truncatedPath =
      suitePath.length > fixedDividerLength - 4
        ? suitePath.substring(0, fixedDividerLength - 4) + "..."
        : suitePath;

    // Create the divider
    const divider = "=".repeat(fixedDividerLength);

    console.log(`\n${divider}\n${truncatedPath}\n${divider}\n`);
  }
}
