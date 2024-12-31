import { SourceMapConsumer } from "source-map";
import { BenchmarkMetrics } from "../core/Bench.js";
import {
  TestCaseStatus,
  TestReport,
  Stats,
  Status,
} from "../framework/TestCase.js";
import kleur from "kleur";
import { ErrorInspect, ErrorMetadata } from "../core/ErrorInspect.js";

/**
 * Interface representing the arguments for logging information about a test case
 */
export interface LogArgs {
  /**
   * A description of the test case or log entry
   *
   * @type {string}
   */
  description: string;

  /**
   * The file associated with the test case, if any
   *
   * @type {string | undefined}
   */
  file?: string;

  /**
   * The duration of the test case in milliseconds
   *
   * @type {number | undefined}
   */
  duration?: number;

  /**
   * The status of the test case (e.g., passed, failed)
   *
   * @type {TestCaseStatus | undefined}
   */
  status?: TestCaseStatus;

  /**
   * The statistics related to the test case
   *
   * @type {Stats | undefined}
   */
  stats?: Stats;

  /**
   * Metadata related to an error that occurred during the test
   *
   * @type {ErrorMetadata | undefined}
   */
  error?: ErrorMetadata;

  /**
   * The number of retries for the test case
   *
   * @type {number | undefined}
   * @default 0
   */
  retries?: number;

  /**
   * Indicates whether the test case failed softly (without breaking the suite)
   *
   * @type {boolean | undefined}
   * @default false
   */
  softFail?: boolean;

  /**
   * Benchmark metrics related to the test case
   *
   * @type {BenchmarkMetrics | null | undefined}
   */
  bench?: BenchmarkMetrics | null;
}

/**
 * Interface representing the options for generating a report
 */
export interface ReportOptions {
  /**
   * The file path where the report will be saved
   *
   * @type {string}
   */
  file: string;

  /**
   * The actual test report data
   *
   * @type {TestReport}
   */
  report: TestReport;

  /**
   * The source map consumer for mapping code to original source
   *
   * @type {SourceMapConsumer}
   */
  sourceMap: SourceMapConsumer;
}

/**
 * Logs the result of a test case
 * 
 * @param {LogArgs} args - The arguments containing the test details such as description, error, retries, etc
 * @param {Status} status - The type of test status
 * @param {SourceMapConsumer} sourceMap - The source map to map errors to the source
 * @returns {string} - A formatted string representing the test case log
 
 */
export function log(
  args: LogArgs,
  status: Status,
  sourceMap: SourceMapConsumer,
): string {
  const { description, file, error, retries, bench, duration } = args;
  const indicators = {
    failed: kleur.red("×"),
    softfailed: kleur.red("!"),
    skipped: kleur.yellow("-"),
    passed: kleur.green("✓"),
    todo: kleur.blue("□"),
  };

  switch (status) {
    case "failed":
    case "softfailed":
      const errorDetails = ErrorInspect.format({
        error: error as any,
        file,
        sourceMap,
      });
      return `${indicators[status]} ${description} in ${duration}ms ${kleur.gray(
        `retries: ${retries}`,
      )}\n${errorDetails}`;

    default:
      const benchFormated = bench ? benchFormat(bench) : "";
      return `${(indicators as any)[status] || "-"} ${description} in ${duration}ms${benchFormated}`;
  }
}

/**
 * Formats benchmark metrics into a readable string
 *
 * @param {BenchmarkMetrics} data - The benchmark metrics to format
 * @returns {string} - A formatted string displaying the benchmark results
 */

export function benchFormat(data: BenchmarkMetrics): string {
  const format = (num: number) => num.toFixed(8);
  const formatOps = (num: number) => num.toLocaleString();

  // Highlighting functions
  const title = (text: string) => kleur.bold(text);
  const label = (text: string) => kleur.bold(text);
  const value = (text: string) => kleur.cyan(text);
  const status = (text: string) => kleur.red(text);

  const divider = kleur.dim("─────────────────────────────────────────────");

  const lines = [
    " ",
    " ",
    title("Benchmark Results"),
    divider,
    `${label("Throughput")}: ${value(formatOps(data.opsPerSecond))} ops/s`,
    "",
    `${label("Latency")}:`,
    `  ${label("Mean")}: ${value(format(data.meanLatency))}ms`,
    `  ${label("p50")}:  ${value(format(data.medianLatency))}ms`,
    `  ${label("p95")}:  ${value(format(data.p95Latency))}ms`,
    `  ${label("Std Dev")}: ±${value(format(data.stdDev))}ms`,
    "",
    `${label("Confidence Interval")}: (${value(data.confidenceInterval.lower.toFixed(2))} - ${value(data.confidenceInterval.upper.toFixed(2))}ms)`,
    `${label("Samples")}: ${value(data.samples.toLocaleString())}`,
    "",
    data.timedOut ? `${status("Status: Timed out")}` : "",
    " ",
  ]
    .filter(Boolean) // Remove empty lines
    .map((line) => "  " + line)
    .join("\n");

  return lines;
}

/**
 * Generates a detailed test report based on the test results and a source map
 *
 * @param {ReportOptions} options - The report options containing the file, report data, and source map
 * @param {string} options.file - The file path to associate with the report
 * @param {TestReport} options.report - The report data including test results
 * @param {SourceMapConsumer} options.sourceMap - The source map to resolve errors
 * @returns {string} - A formatted string representing the generated report
 */

export function generateReport({
  file,
  report,
  sourceMap,
}: ReportOptions): string {
  const items = [...report.tests, ...report.hooks];
  if (items.length === 0) {
    return `${report.description} is empty`;
  }

  const output = items.map((test) => {
    const logEntry = log(
      {
        description: test.description,
        error: test.error,
        file,
        retries: test.retries,
        softFail: test.status === "softfailed",
        duration: test.duration,
        bench: test.bench,
      },
      test.status,
      sourceMap,
    );

    return logEntry;
  });

  return (
    output
      .filter(Boolean)
      .map((line) => "  " + line)
      .join("\n") + "\n"
  );
}

/**
 * Generates a summary of the test run results
 *
 * @param {Object} stats - The statistics of the test run
 * @param {number} stats.total - The total number of tests
 * @param {number} stats.passed - The number of passed tests
 * @param {number} stats.failed - The number of failed tests
 * @param {number} stats.skipped - The number of skipped tests
 * @param {number} stats.softfailed - The number of soft failed tests
 * @param {number} stats.todo - The number of to-do tests
 * @param {number} stats.duration - The total duration of the test run in seconds
 * @returns {string} - A formatted string representing the summary of the test run
 */

export function summary(stats: {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  softfailed: number;
  todo: number;
  duration: number;
}): string {
  const { total, passed, failed, skipped, softfailed, duration } = stats;
  const percent = (count: number) =>
    total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

  const parts = [
    `Total: ${total} in ${duration.toFixed(2)}s`,
    passed && kleur.green(`✓ ${passed} (${percent(passed)}%)`),
    failed && kleur.red(`× ${failed} (${percent(failed)}%)`),
    softfailed && kleur.red(`! ${softfailed} (${percent(softfailed)}%)`),
    skipped && kleur.yellow(`- ${skipped} (${percent(skipped)}%)`),
  ];

  return `\n${parts.filter(Boolean).join("\n")}\n\n✨ All Tests ran. ✨\n`;
}
