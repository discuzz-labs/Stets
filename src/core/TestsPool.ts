/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Loader } from "../core/Loader";
import { ExecResult, Isolated } from "../core/Isolated";
import { ErrorParser } from "../utils/ErrorParser";
import { Console, LogEntry, replay } from "./Console";
import draftLog from "draftlog";
import path from "path";
import { Reporter } from "../reporters/Reporter";

interface TestStatusDraft {
  draft: (message: string) => void;
  initialMessage: string;
  reportContent: string;
  logEntries: LogEntry[];
}

draftLog(console);

export class TestsPool {
  private readonly loader: Loader = new Loader();
  private readonly drafts: Map<string, TestStatusDraft> = new Map();

  constructor(private readonly testFiles: string[]){}

  private createDraft(testFile: string): void {
    const message = Reporter.start({ file: testFile });
    const draft = console.draft(message);
    this.drafts.set(testFile, {
      draft,
      initialMessage: message,
      reportContent: "",
      logEntries: [],
    });
  }

  private updateDraft(testFile: string, content: string): void {
    const draft = this.drafts.get(testFile);
    if (draft) draft.reportContent += content;
  }

  private addLogs(testFile: string, logs: LogEntry[]): void {
    const draft = this.drafts.get(testFile);
    if (draft) draft.logEntries = logs;
  }

  private finalizeDraft(testFile: string, status: "passed" | "failed"): void {
    const draft = this.drafts.get(testFile);
    if (draft) draft.draft(Reporter.finish({ file: testFile, status }));
  }

  private async runTest(testFile: string): Promise<void> {
    const logger = new Console();
    try {
      this.createDraft(testFile);
      const { code, filename } = this.loader.require(testFile);

      if (!code || !filename)
        throw new Error(`Unable to load test file: ${testFile}`);

      const startTime = Date.now();
      const isolated = new Isolated(filename);
      const execResult = await isolated.exec({
        script: isolated.script(code),
        context: isolated.context({ console: logger }),
      });

      this.addLogs(testFile, logger.logs);
      this.testCaseResult(testFile, execResult, Date.now() - startTime);
    } catch (error) {
      this.testCaseError(testFile, error as Error);
    }
  }

  private testCaseResult(
    testFile: string,
    testResult: ExecResult,
    duration: number,
  ): void {
    const testName = testResult.report?.description || path.basename(testFile);

    this.updateDraft(
      testFile,
      Reporter.testCase({
        name: testName,
        file: testFile,
        duration,
        stats: testResult.report?.stats || {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
        },
      }),
    );

    if (testResult.status && testResult.report) {
      this.finalizeDraft(testFile, testResult.report.status);
      this.updateDraft(
        testFile,
        Reporter.report({ report: testResult.report, file: testFile }),
      );
    } else {
      this.invalidReport(testFile, testResult.error);
    }
  }

  private invalidReport(testFile: string, error: Error | null): void {
    this.finalizeDraft(testFile, "failed");
    const errorMessage = error
      ? ErrorParser.format({
          error,
          filter: testFile,
          maxLines: 10,
        })
      : "Invalid report: ensure to use run() at the end of the file!";
    this.updateDraft(testFile, errorMessage);
  }

  private testCaseError(testFile: string, error: Error): void {
    this.finalizeDraft(testFile, "failed");
    const errorMessage = ErrorParser.format({
      error,
      filter: testFile,
      maxLines: 10,
    });
    this.updateDraft(testFile, errorMessage);
  }

  public async runTests(): Promise<void> {
    try {
      await Promise.all(this.testFiles.map((file) => this.runTest(file)));
    } finally {
      this.clearConsole();
      this.drafts.forEach(({ reportContent, logEntries }) => {
        console.log(reportContent);
        replay(logEntries);
      });
      console.log(Reporter.summary());
    }
  }

  private clearConsole(): void {
    process.stdout.write("\x1Bc");
    process.stdout.write("\x1B[2J\x1B[0f");
    process.stdout.write("\x1B[H\x1B[2J");
  }
}
