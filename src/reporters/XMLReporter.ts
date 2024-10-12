/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { JsonReporter } from "./JsonReporter";

export class XMLReporter extends JsonReporter {
  reportType: string = "xml";

  /**
   * Generates the XML report by creating the structure from the results.
   */
  formatReportFile(): string {
    const { suites, totalSuites, totalTests, failedSuites, succededSuites, failedTests, succededTests, ignoredTests, duration } = this.results;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<testReport>\n`;
    xml += `  <summary>\n`;
    xml += `    <totalSuites>${totalSuites}</totalSuites>\n`;
    xml += `    <passedSuites>${succededSuites}</passedSuits>\n`;
    xml += `    <failedSuites>${failedSuites}</failedSuites>\n`;
    xml += `    <totalTests>${totalTests}</totalTests>\n`;
    xml += `    <passedTests>${succededTests}</passedTests>\n`;
    xml += `    <failedTests>${failedTests}</failedTests>\n`;
    xml += `    <ignoredTests>${ignoredTests}</ignoredTests>\n`;
    xml += `    <duration>${duration}</duration>\n`;
    xml += `  </summary>\n`;

    // Iterate over each suite and its tests
    suites.forEach((suite: any) => {
      xml += `  <testSuite description="${suite.description}" status="${suite.status}" duration="${suite.duration}">\n`;
      xml += `    <path>${suite.path}</path>\n`;

      suite.tests.forEach((test: any) => {
        xml += `    <test description="${test.description}" status="${test.status}" duration="${test.duration}">\n`;

        if (test.status === "failed" && test.error) {
          xml += `      <error>\n`;
          xml += `        ${test.error}\n`;
          xml += `      </error>\n`;
        }

        xml += `    </test>\n`;
      });

      xml += `  </testSuite>\n`;
    });

    xml += `</testReport>`;
    return xml;
  }
}