/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Loader } from "../core/Loader";
import { ExecResult, Isolated } from "../core/Isolated";
import { ErrorParser } from "../utils/ErrorParser";
import { Reporter } from "../reporters/Reporter";
import { Console, LogEntry, replay } from "./Console";
import draftLog from "draftlog";
import path from "path";

// Define interfaces for better type safety
interface TestDraft {
  draft: (message: string) => void;
  message: string;
  report: string;
  logs: LogEntry[];
}

// Initialize draftlog
draftLog(console);

export class TestsPool {
  private readonly loader: Loader;
  private readonly drafts: Map<string, TestDraft> = new Map();
  private readonly MAX_ERROR_LINES = 10;

  constructor(private readonly files: string[]) {
    this.loader = new Loader();
  }

  private start(file: string): void {
    const initialMessage = Reporter.start(file);
    const draft = console.draft(initialMessage);
    this.drafts.set(file, { draft, message: initialMessage, report: "", logs:  [] });
  }

  private append(file: string, content: string): void {
    const entry = this.drafts.get(file);
    if (entry) {
      entry.report += content;
    }
  }

  private addLogs(file: string, logs: LogEntry[]) {
    const entry = this.drafts.get(file)
    if(entry) entry.logs = logs
  }

  private finished(file: string, status: boolean): void {
    const entry = this.drafts.get(file);
    if (!entry) return;
    entry.draft(Reporter.finish(file, status));
  }

  private async runSingleTest(file: string): Promise<void> {
    const logger = new Console();

    try {
      this.start(file);
      const { code, filename } = this.loader.require(file);

      if (!code || !filename) {
        throw new Error(`Failed to load test file: ${file}`);
      }

      const start = Date.now();
      const isolated = new Isolated(filename);
      const execResult = await isolated.exec({
        script: isolated.script(code),
        context: isolated.context({ console: logger }),
      });

      const duration = Date.now() - start;

      this.addLogs(file, logger.logs)
      this.handleTestResult(file, execResult, duration);
      
    } catch (error) {
      this.handleTestError(file, error as Error);
    }
  }

  private handleTestResult(
    file: string,
    execResult: ExecResult,
    duration: number,
  ): void {
    const testCaseName = execResult.report?.description || path.basename(file);

    this.append(
      file,
      Reporter.case({
        testCaseName,
        file,
        duration,
        stats: execResult.report?.stats || {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
        },
      }),
    );

    if (execResult.status && execResult.report) {
      this.finished(file, execResult.report.passed);
      this.append(
        file,
        Reporter.report({
          report: execResult.report,
          file,
        }),
      );
    } else if (execResult.error) {
      this.finished(file, false);
      const errorMessage = ErrorParser.format(
        {
          message: execResult.error.message,
          stack: execResult.error.stack,
        },
        { filter: file, maxLines: this.MAX_ERROR_LINES },
      );
      this.append(file, errorMessage);
    } else {
      this.finished(file, false);
      this.append(
        file,
        "Invalid report received, use run() at the end of the file!",
      );
    }
  }

  private handleTestError(file: string, error: Error): void {
    this.finished(file, false);
    const errorMessage = ErrorParser.format(
      {
        message: error.message,
        stack: error.stack,
      },
      {
        filter: file,
        maxLines: this.MAX_ERROR_LINES,
      },
    );
    this.append(file, errorMessage);
  }

  public async runTests(): Promise<void> {
    try {
      await Promise.all(this.files.map((file) => this.runSingleTest(file)));
    } finally {
      // Clear console and print final reports
      process.stdout.write("\x1Bc"); // ANSI clear screen
      process.stdout.write("\x1B[2J\x1B[0f"); // Alternative ANSI clear
      process.stdout.write("\x1B[H\x1B[2J"); // Yet another ANSI clear

      this.drafts.forEach(({ report, logs }) => {
        console.log(report);
        replay(logs);
      });

      console.log(Reporter.summary());
    }
  }
}
