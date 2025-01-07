/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as fs from "fs";
import * as path from "path";
import { Reporter } from "./Reporter.js";
import { PoolResult } from "../core/Pool.js";
import kleur from "kleur";

export interface json extends Reporter {}

/**
 * Generates a detailed test report in JSON format and writes it to a file.
 *
 * @type {json}
 */

export const json: json = {
  name: "jsonReporter",
  type: "file",
  report: async function (options: {
    reports: Map<string, PoolResult>;
    outputDir: string;
  }) {
    const testResults: {
      summary: {
        totalTests: number;
        totalPassed: number;
        totalFailed: number;
        totalSkipped: number;
        totalDuration: number;
      };
      testFiles: Array<{
        name: string;
        total: number;
        passed: number;
        failed: number;
        skipped: number;
        duration: number;
        tests: Array<{
          name: string;
          status: string;
          duration: number;
          error?: {
            stack?: string;
          };
        }>;
        fileError?: {
          message: string;
        };
      }>;
    } = {
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalDuration: 0,
      },
      testFiles: [],
    };

    // Process each test report
    for (const [
      file,
      { error, duration, report, sourceMap },
    ] of options.reports) {
      const testFile: (typeof testResults.testFiles)[number] = {
        name: file,
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration,
        tests: [],
      };

      if (report) {
        // Update test file statistics
        testFile.total = report.stats.total;
        testFile.passed = report.stats.passed;
        testFile.failed = report.stats.failed;
        testFile.skipped = report.stats.skipped;

        // Process individual tests
        for (const test of report.tests) {
          const testResult: (typeof testFile.tests)[number] = {
            name: test.description,
            status: test.status,
            duration: test.duration,
          };

          // Add error details for failed tests
          if (test.status === "failed" && test.error) {
            testResult.error = {
              stack: test.error.stack,
            };
          }

          testFile.tests.push(testResult);
        }
      }

      // Handle file-level errors
      if (error) {
        testFile.fileError = {
          message: error({ error, file }),
        };
      }

      // Add to test files
      testResults.testFiles.push(testFile);

      // Update summary statistics
      testResults.summary.totalTests += testFile.total;
      testResults.summary.totalPassed += testFile.passed;
      testResults.summary.totalFailed += testFile.failed;
      testResults.summary.totalSkipped += testFile.skipped;
      testResults.summary.totalDuration += duration;
    }

    // Write the JSON report to the specified directory
    const outputPath = path.join(options.outputDir, "test-report.json");
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

    // Use JSON.stringify with pretty printing
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(testResults, null, 2),
      "utf-8",
    );

    console.log(`${kleur.green("✓")} JSON report generated at ${outputPath}`);
  },
};
