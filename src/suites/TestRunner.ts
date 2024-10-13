import { Suite } from "../framework/Suite";
import { SuiteCase, Test, TestMetadata } from "../types";
import { Log } from "../utils/Log";
import { RuntimeError } from "../runtime/RuntimeError";

export class TestRunner {
  private executedTests: Set<number> = new Set();

  constructor(
    private suiteCase: SuiteCase,
    private failedTestIndexes: Set<number>,
  ) {}

  async runAllTests(suite: Suite): Promise<void> {
    for (let id = 0; id < suite.tests.length; id++) {
      const test = suite.tests[id];
      const metadata = this.getTestMetadata(suite, id);

      // Skip ignored tests
      if (metadata.ignore) {
        Log.info(`Test ignored: ${test.description}`);
        this.addIgnoredTestReport(id, test.description);
        continue;
      }

      // Resolve dependencies
      if (this.hasUnresolvedDependencies(suite, test, metadata)) {
        continue;
      }

      // Run the test with retries and timeout
      await this.runTest(suite, test, metadata);
      this.executedTests.add(id); // Mark test as executed by its index
    }
  }

  private async runTest(
    suite: Suite,
    test: Test,
    metadata: TestMetadata,
  ): Promise<void> {
    const testStartTime = Date.now();
    const maxRetries = metadata.retry || 0;
    let attempt = 0;
    let lastError: any;

    while (attempt <= maxRetries) {
      try {
        attempt++;
        Log.info(`Running test: ${test.description} (Attempt ${attempt})`);

        // Fetch the latest metadata before executing the test
        let updatedMetadata =
          suite.testMetadata[metadata.index] || metadata;

        suite.currentTestIndex = updatedMetadata.index;

        // Run the beforeEach hook with the updated metadata
        await suite.beforeEachFn(suite, updatedMetadata);

        // Run the preRun function if it exists and pass updated metadata and update function
        if (updatedMetadata.preRun) {
          await updatedMetadata.preRun(
            suite,
            updatedMetadata,
            (updates: Partial<TestMetadata>) => {
              this.updateMetadata(suite, metadata.index, updates);
              updatedMetadata = { ...updatedMetadata, ...updates };
            },
          );
        }

        // Run the actual test function with timeout, passing updateMetadata as well
        await this.runWithTimeout(
          test.fn(suite, updatedMetadata, (updates: Partial<TestMetadata>) => {
            this.updateMetadata(suite, metadata.index, updates);
            updatedMetadata = { ...updatedMetadata, ...updates };
          }),
          updatedMetadata.timeout || 10000,
        );

        // Re-check if ignore was updated dynamically during the test
        if (updatedMetadata.ignore) {
          Log.info(`Test updated to be ignored: ${test.description}`);
          this.suiteCase.reports.push({
            id: updatedMetadata.index,
            description: test.description,
            status: "ignored",
            duration: Date.now() - testStartTime,
          });
          return; // Skip further processing
        }

        // Run the postRun function if it exists and pass updated metadata and update function
        if (updatedMetadata.postRun) {
          await updatedMetadata.postRun(
            suite,
            updatedMetadata,
            (updates: Partial<TestMetadata>) => {
              this.updateMetadata(suite, metadata.index, updates);
              updatedMetadata = { ...updatedMetadata, ...updates };
            },
          );
        }

        // Run the afterEach hook with the updated metadata
        await suite.afterEachFn(suite, updatedMetadata);

        // Report success
        this.suiteCase.reports.push({
          id: updatedMetadata.index,
          description: test.description,
          status: "success",
          duration: Date.now() - testStartTime,
        });

        // If the test passes, break the retry loop
        break;
      } catch (error: any) {
        lastError = error;
        if (attempt > maxRetries) {
          // If retries are exhausted, handle failure
          this.handleTestFailure(test, metadata, error);
          break;
        } else {
          // If retry is needed, log it and wait before the next attempt
          Log.warn(`Test failed on attempt ${attempt}. Retrying...`);
          await this.handleRetryDelay(metadata.retryDelay || 1000);
        }
      } finally {
        // Ensure test duration is set regardless of success or failure
        this.setTestDuration(metadata.index, test.description, testStartTime);
      }
    }
  }

  private handleTestFailure(
    test: Test,
    metadata: TestMetadata,
    error: any,
  ): void {
    const runtimeError = new RuntimeError({
      description: test.description,
      message: error.message,
      stack: error.stack,
    });

    Log.error(`Test failed: ${test.description}, ${error}`);
    this.suiteCase.reports.push({
      id: metadata.index,
      status: "failed",
      description: test.description,
      error: runtimeError,
      duration: -1,
    });
    this.failedTestIndexes.add(metadata.index); // Mark this test as failed
  }

  private hasUnresolvedDependencies(
    suite: Suite,
    test: Test,
    metadata: TestMetadata,
  ): boolean {
    if (metadata.dependsOn) {
      const dependentTestIndex = this.getTestIndexByName(
        suite,
        metadata.dependsOn,
      );
      if (
        dependentTestIndex === -1 ||
        this.failedTestIndexes.has(dependentTestIndex) ||
        !this.executedTests.has(dependentTestIndex)
      ) {
        const message = `Skipping test "${test.description}" because dependency "${metadata.dependsOn}" (Test #${dependentTestIndex}) failed or was not executed.`;
        Log.warn(message);
        this.handleTestFailure(test, metadata, new Error(message));
        return true;
      }
    }
    return false;
  }

  private getTestMetadata(suite: Suite, index: number): TestMetadata {
    return suite.testMetadata[index] || { index, retry: 1, timeout: 5000 };
  }

  private getTestIndexByName(suite: Suite, name: string): number {
    for (let i = 0; i < suite.tests.length; i++) {
      const metadata = suite.testMetadata[i]
      if (metadata?.name === name) {
        return i;
      }
    }
    return -1;
  }

  private async handleRetryDelay(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private async runWithTimeout(
    promise: Promise<any>,
    timeout: number,
  ): Promise<any> {
    if (timeout <= 0) return promise;
    let timer: any;
    return Promise.race([
      new Promise(
        (_, reject) =>
          (timer = setTimeout(
            () => reject(new Error("Test timed out")),
            timeout,
          )),
      ),
      promise.then((value) => {
        clearTimeout(timer);
        return value;
      }),
    ]);
  }

  private setTestDuration(
    id: number,
    description: string,
    startTime: number,
  ): void {
    const testEndTime = Date.now();
    const testDuration = testEndTime - startTime;
    const report = this.suiteCase.reports.find((report) => report.id === id);
    if (report) {
      report.duration = testDuration;
    }
    Log.info(`Test completed: ${description}, Duration: ${testDuration}ms`);
  }

  private updateMetadata(
    suite: Suite,
    index: number,
    updates: Partial<TestMetadata>,
  ): void {
    // Ensure that metadata at the given index exists, or use an empty object
    const currentMetadata =
      suite.testMetadata[index] || ({ index } as TestMetadata);

    // Merge the updates with the existing metadata
    suite.testMetadata[index] = { ...currentMetadata, ...updates };
  }

  private addIgnoredTestReport(id: number, description: string): void {
    this.suiteCase.reports.push({
      id,
      description,
      status: "ignored",
      duration: 0,
    });
  }
}
