/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as fs from "fs";
import { join } from "path";
import { TestReport } from "../framework/TestCase";

export type ReportFormat = "json" | "junit" | "html";

export interface GenerateOptions {
  formats?: ReportFormat[];
  outputDir: string;
  timestamp?: boolean;
}

export class Generate {
  private report: TestReport;
  private options: GenerateOptions;

  constructor(report: TestReport, options: GenerateOptions) {
    this.report = report;
    this.options = {
      formats: ["json"],
      timestamp: true,
      ...options,
    };
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  public toJSON(): string {
    try {
      return JSON.stringify(this.report, null, 2);
    } catch (error: any) {
      throw new Error(`Failed to generate JSON report: ${error.message}`);
    }
  }

  public toJUnit(): string {
    try {
      const timestamp = new Date().toISOString();

      const testcases = this.report.tests
        .map((test) => {
          const testCase = [
            `      <testcase`,
            `          name="${this.xmlEscape(test.description)}"`,
            `          classname="${this.xmlEscape(this.report.description)}"`,
            `      >`,
          ];

          if (test.error) {
            testCase.push(
              `        <failure message="${this.xmlEscape(test.error.message || "")}"`,
              `                 type="Error">`,
              `          <![CDATA[${test.error.stack || ""}]]>`,
              `        </failure>`,
            );
          }

          if (test.status === "skipped") {
            testCase.push("        <skipped/>");
          }

          testCase.push("      </testcase>");
          return testCase.join("\n");
        })
        .join("\n");

      const hooks = this.report.hooks
        .map((hook) => {
          return `      <property name="hook.${this.xmlEscape(hook.description)}" value="${this.xmlEscape(hook.status)}"/>`;
        })
        .join("\n");

      return `<?xml version="1.0" encoding="UTF-8"?>
  <testsuites>
    <testsuite name="${this.xmlEscape(this.report.description)}"
               tests="${this.report.stats.total}"
               failures="${this.report.stats.failed}"
               errors="0"
               skipped="${this.report.stats.skipped}"
               timestamp="${timestamp}">
      <properties>
  ${hooks}
      </properties>
  ${testcases}
    </testsuite>
  </testsuites>`;
    } catch (error: any) {
      throw new Error(`Failed to generate JUnit report: ${error.message}`);
    }
  }

  private xmlEscape(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
  public toHTML(): string {
    try {
      const testsHtml = this.report.tests
        .map((test) => {
          const statusClass = this.getStatusClass(test.status);
          return `
            <tr class="${statusClass}">
              <td>${this.escapeHtml(test.description)}</td>
              <td>${test.status}</td>
              <td>${test.retries}</td>
              <td>${test.error ? this.escapeHtml(test.error.message || "") : "N/A"}</td>
              <td>${test.bench ? JSON.stringify(test.bench) : "N/A"}</td>
            </tr>`;
        })
        .join("");

      const hooksHtml = this.report.hooks
        .map((hook) => {
          const statusClass = this.getStatusClass(hook.status);
          return `
            <tr class="${statusClass}">
              <td>${this.escapeHtml(hook.description)}</td>
              <td>${hook.status}</td>
              <td>${hook.retries}</td>
              <td>${hook.error ? this.escapeHtml(hook.error.message || "") : "N/A"}</td>
              <td>N/A</td>
            </tr>`;
        })
        .join("");

      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${this.escapeHtml(this.report.description)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
        .stat-card { 
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f8f9fa;
        }
        .passed { background-color: #dff0d8; }
        .failed { background-color: #f2dede; }
        .skipped { background-color: #fcf8e3; }
        .softfailed { background-color: #fff3cd; }
        .todo { background-color: #d9edf7; }
    </style>
</head>
<body>
    <h1>${this.escapeHtml(this.report.description)}</h1>

    <div class="stats">
        <div class="stat-card">
            <h3>Total Tests</h3>
            <p>${this.report.stats.total}</p>
        </div>
        <div class="stat-card">
            <h3>Passed</h3>
            <p>${this.report.stats.passed}</p>
        </div>
        <div class="stat-card">
            <h3>Failed</h3>
            <p>${this.report.stats.failed}</p>
        </div>
        <div class="stat-card">
            <h3>Skipped</h3>
            <p>${this.report.stats.skipped}</p>
        </div>
        <div class="stat-card">
            <h3>Soft Failed</h3>
            <p>${this.report.stats.softfailed}</p>
        </div>
        <div class="stat-card">
            <h3>Todo</h3>
            <p>${this.report.stats.todo}</p>
        </div>
    </div>

    <h2>Tests</h2>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Status</th>
                <th>Retries</th>
                <th>Error</th>
                <th>Benchmark</th>
            </tr>
        </thead>
        <tbody>
            ${testsHtml}
        </tbody>
    </table>

    <h2>Hooks</h2>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Status</th>
                <th>Retries</th>
                <th>Error</th>
                <th>Benchmark</th>
            </tr>
        </thead>
        <tbody>
            ${hooksHtml}
        </tbody>
    </table>
</body>
</html>`;
    } catch (error: any) {
      throw new Error(`Failed to generate HTML report: ${error.message}`);
    }
  }

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      passed: "passed",
      failed: "failed",
      skipped: "skipped",
      softfailed: "softfailed",
      todo: "todo",
    };
    return statusMap[status] || "";
  }

  public writeReports(): number {
    let reportsNumber = 0;

    try {
      const outputDir = join(process.cwd(), this.options.outputDir);
      const baseFilename = this.report.description
        .concat(this.options.timestamp ? "_" + new Date().toString() : "")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      this.options.formats?.forEach((format) => {
        const content = this.getReportContent(format);
        const extension = format === "junit" ? "xml" : format;
        const filepath = join(outputDir, `${baseFilename}.${extension}`);
        fs.writeFileSync(filepath, content, "utf8");
        reportsNumber += 1;
      });
    } catch (error: any) {
      throw new Error(`Failed to write reports: ${error.message}`);
    } finally {
      return reportsNumber;
    }
  }

  private getReportContent(format: ReportFormat): string {
    switch (format) {
      case "json":
        return this.toJSON();
      case "junit":
        return this.toJUnit();
      case "html":
        return this.toHTML();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
