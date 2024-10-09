/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { JsonReporter } from "./JsonReporter";

export class MdReporter extends JsonReporter {
  reportType: string = "md";

  /**
   * Generates the Markdown report by manually creating the structure from the results.
   */
  formatReportFile(): string {
    const { suites, total, passed, failed, duration } = this.results;

    let markdown = `# Test Report\n\n`;
    markdown += `**Total Tests:** ${total}\n\n`;
    markdown += `**Passed:** ${passed}\n\n`;
    markdown += `**Failed:** ${failed}\n\n`;
    markdown += `**Duration:** ${duration} ms\n\n`;
    markdown += `---\n\n`;

    // Iterate over each suite and its tests
    suites.forEach((suite: any) => {
      markdown += `## Suite: ${suite.description} (${suite.status.toUpperCase()})\n\n`;
      markdown += `- **Path:** ${suite.path}\n`;
      markdown += `- **Duration:** ${suite.duration} ms\n\n`;

      suite.tests.forEach((test: any) => {
        const testStatus = test.status === "success" ? "✅" : "❌";
        markdown += `### ${testStatus} Test: ${test.description}\n`;
        markdown += `- **Status:** ${test.status}\n`;
        markdown += `- **Duration:** ${test.duration} ms\n`;

        // Handle error details for failed tests
        if (test.status === "failed" && test.error) {
          markdown += `\n#### Error Details:\n`;
          markdown += `- **Message:** ${test.error.message}\n`;
          markdown += `- **Location:** \`${test.error.location.file}:${test.error.location.line}:${test.error.location.char}\`\n\n`;
          markdown += `\`\`\`plaintext\n${test.error.message}\n\`\`\`\n\n`;
        }

        markdown += `---\n\n`; // Add a divider between tests
      });
    });

    return markdown;
  }
}