/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { JsonReporter } from "./JsonReporter";

export class HtmlReporter extends JsonReporter {
  reportType: string = "html";

  /**
   * Generates the HTML report by manually creating the HTML structure from the results.
   */
  formatReportFile(): string {
    const { suites, totalSuites, totalTests, failedSuites, succededSuites, failedTests, succededTests, ignoredTests, duration } = this.results;

    // Build the HTML structure
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #333; }
          .summary { margin-bottom: 20px; }
          .suite { margin-bottom: 40px; }
          .success { color: green; }
          .failed { color: red; }
          .ignored { color: yellow; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px 12px; border: 1px solid #ddd; }
          .error-details { font-size: 0.9em; color: #a00; }
          .error-location { color: #444; }
        </style>
      </head>
      <body>
        <h1>Test Report</h1>
        <div class="summary">
          <p><strong>Total Suites:</strong> ${totalSuites}</p>
          <p><strong>Passed Suites:</strong> <span class="passed">${succededSuites}</span></p>
          <p><strong>Failed Suites:</strong> <span class="failed">${failedSuites}</span></p>

          <p><strong>Total Tests:</strong> ${totalTests}</p>
            <p><strong>Passed Tests:</strong> <span class="passed">${succededTests}</span></p>
            <p><strong>Failed Tests:</strong> <span class="failed">${failedTests}</span></p>
            <p><strong>Ignored Tests:</strong> <span class="failed">${ignoredTests}</span></p>
            
          <p><strong>Duration:</strong> ${duration} ms</p>
        </div>
    `;

    // Iterate over each suite and its tests
    suites.forEach((suite: any) => {
      html += `
        <div class="suite">
          <h2>${suite.description} (${suite.status})</h2>
          <p>Path: ${suite.path}</p>
          <p>Duration: ${suite.duration} ms</p>
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Status</th>
                <th>Duration (ms)</th>
                <th>Error (if any)</th>
              </tr>
            </thead>
            <tbody>
      `;

      // Iterate over each test in the suite
      suite.tests.forEach((test: any) => {
        const testStatusClass = test.status

        // Handle error structure when the test fails
        let errorDetails = "N/A";
        if (test.error) {
          errorDetails = `
            <div class="error-details">
              <strong>Error Message:</strong> ${test.error.message} <br />
              <span class="error-location">
                <strong>Location:</strong> ${test.error.location.file} 
                at line ${test.error.location.line}, char ${test.error.location.char}
              </span>
            </div>
          `;
        }

        html += `
          <tr>
            <td>${test.description}</td>
            <td class="${testStatusClass}">${test.status}</td>
            <td>${test.duration}</td>
            <td>${errorDetails}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    html += `
      </body>
      </html>
    `;

    return html;
  }
}