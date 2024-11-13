/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import draftLog from "draftlog";
import path from "path";
import { Loader } from "./Loader.js";
import { Process } from "./Process.js";
import { ExecResult, Isolated } from "./Isolated.js";
import { ErrorParser } from "../utils/ErrorParser.js";
import { Console, LogEntry, replay } from "./Console.js";
import { Reporter } from "../reporters/Reporter.js";
import { Status } from "../framework/TestCase.js";

interface TestStatusDraft {
  draft: (message: string) => void;
  initialMessage: string;
  reportContent: string;
  logEntries: LogEntry[];
}

draftLog(console);

export class TestsPool {
  private readonly loader: Loader = new Loader();
  private readonly context = new Process().context();
  private readonly drafts: Map<string, TestStatusDraft> = new Map();

  constructor(
    private readonly options: { testFiles: string[]; timeout: number },
  ) {}

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

  private updateReport(testFile: string, content: string): void {
    const draft = this.drafts.get(testFile);
    if (draft) draft.reportContent += content;
  }

  private addLogs(testFile: string, logs: LogEntry[]): void {
    const draft = this.drafts.get(testFile);
    if (draft) draft.logEntries = logs;
  }

  private finishDraft(testFile: string, status: Status): void {
    const draft = this.drafts.get(testFile);
    if (draft) draft.draft(Reporter.finish({ file: testFile, status }));
  }

  private async runTest(testFile: string): Promise<void> {
    const logger = new Console();
    this.createDraft(testFile);
    try {
      const code = this.loader.require(testFile);

      if (!code)
        throw new Error(
          `Unable to load test file: ${testFile}. Code or filename`,
        );

      const startTime = Date.now();
      const isolated = new Isolated(testFile);
      const execResult = await isolated.exec({
        script: isolated.script(code),
        context: isolated.context({ console: logger, ...this.context }),
        timeout: this.options.timeout,
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

    this.updateReport(
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
          softFailed: 0,
        },
        status: testResult.report?.status || "failed",
      }),
    );

    if (testResult.status && testResult.report) {
      this.finishDraft(testFile, testResult.report.status);
      this.updateReport(
        testFile,
        Reporter.report({ report: testResult.report, file: testFile }),
      );
    } else {
      this.invalidReport(testFile, testResult.error);
    }
  }

  private invalidReport(testFile: string, error: Error | null): void {
    this.finishDraft(testFile, "failed");
    const errorMessage = error
      ? ErrorParser.format({
          error,
          filter: testFile,
          maxLines: 10,
        })
      : "Invalid report: ensure to use run() at the end of the file!";
    this.updateReport(testFile, errorMessage);
  }

  private testCaseError(testFile: string, error: Error): void {
    const errorMessage = ErrorParser.format({
      error,
      filter: testFile,
      maxLines: 10,
    });
    this.updateReport(
      testFile,
      Reporter.finish({ file: testFile, status: "failed" }) + "\n",
    );
    this.updateReport(testFile, errorMessage);
    this.finishDraft(testFile, "failed");
  }

  public async runTests(): Promise<void> {
    try {
      await Promise.all(
        this.options.testFiles.map((file) => this.runTest(file)),
      );
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
