import { JsonReporter } from "./JsonReporter";

export class HtmlReporter extends JsonReporter {
  reportType: string = "html";

  /**
   * Generates the HTML report by manually creating the HTML structure from the results.
   */
  formatReportFile(): string {
    const { suites, total, passed, failed, duration } = this.results;

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
          .passed { color: green; }
          .failed { color: red; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px 12px; border: 1px solid #ddd; }
          .error-details { font-size: 0.9em; color: #a00; }
          .error-location { color: #444; }
        </style>
      </head>
      <body>
        <h1>Test Report</h1>
        <div class="summary">
          <p><strong>Total Tests:</strong> ${total}</p>
          <p><strong>Passed:</strong> <span class="passed">${passed}</span></p>
          <p><strong>Failed:</strong> <span class="failed">${failed}</span></p>
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
        const testStatusClass = test.status === "success" ? "passed" : "failed";

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