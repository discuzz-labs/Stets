/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { JsonReporter } from "./JsonReporter";

export class CSVReporter extends JsonReporter {
  reportType: string = "csv";

  /**
   * Formats the test results into a CSV string.
   * @returns {string} - The CSV formatted string of test results.
   */
  formatReport(): string {
    const { suites } = this.results;
    
    // CSV headers
    let csvData = "Suite, Test, Status, Duration (ms), Error Message, File, Line, Char\n";

    suites.forEach((suite) => {
      suite.tests.forEach((test) => {
        const errorDetails = test.error
          ? `${test.error.message},${test.error.location.file},${test.error.location.line},${test.error.location.char}`
          : ",,,";

        csvData += `${suite.description}, ${test.description}, ${test.status}, ${test.duration}, ${errorDetails}\n`;
      });
    });
    return csvData;
  }
}