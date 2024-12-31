/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export interface BenchmarkOptions {
  /**
   * Number of iterations to run the benchmark
   * 
   * @type {number | undefined}
   */
  iterations?: number;

  /**
   * Number of warmup iterations to run before benchmarking
   * 
   * @type {number | undefined}
   */
  warmup?: number;

  /**
   * Timeout value in milliseconds for the benchmark
   * 
   * @type {number | undefined}
   */
  timeout?: number;

  /**
   * Confidence level for the benchmark results
   * 
   * @type {number | undefined}
   */
  confidence?: number;
}

export interface BenchmarkMetrics {
  /**
   * Mean latency in milliseconds
   * 
   * @type {number}
   */
  meanLatency: number;

  /**
   * Median latency in milliseconds
   * 
   * @type {number}
   */
  medianLatency: number;

  /**
   * 95th percentile latency in milliseconds
   * 
   * @type {number}
   */
  p95Latency: number;

  /**
   * Standard deviation of latency in milliseconds
   * 
   * @type {number}
   */
  stdDev: number;

  /**
   * Operations per second
   * 
   * @type {number}
   */
  opsPerSecond: number;

  /**
   * Confidence interval for the benchmark results
   * 
   * @type {{ lower: number, upper: number }}
   */
  confidenceInterval: {
    lower: number;
    upper: number;
  };

  /**
   * Number of samples collected during benchmarking
   * 
   * @type {number}
   */
  samples: number;

  /**
   * Timestamp when the benchmark was completed
   * 
   * @type {number}
   */
  timestamp: number;

  /**
   * Whether the benchmark timed out
   * 
   * @type {boolean}
   */
  timedOut: boolean;
}


export class Bench {
  static async run(
    fn: () => unknown | Promise<unknown>,
    options: BenchmarkOptions,
  ): Promise<BenchmarkMetrics> {
    const config = this.validateOptions({
      ...options,
    });

    const samples: number[] = [];
    let timedOut = false;

    // Warmup phase with high-resolution timing
    for (let i = 0; i < config.warmup; i++) {
      await this.measure(fn, []);
    }

    // Main benchmark phase
    const startTime = Date.now();

    try {
      while (samples.length < config.iterations && !timedOut) {
        if (Date.now() - startTime > config.timeout) {
          timedOut = true;
          break;
        }
        await this.measure(fn, samples);
      }

      return this.calculateMetrics(samples, timedOut, config.confidence);
    } catch (error) {
      return this.createEmptyMetrics(true);
    }
  }

  private static async measure(
    fn: () => unknown | Promise<unknown>,
    samples: number[],
  ): Promise<void> {
    const start = this.getHighResTime();
    await fn();
    const end = this.getHighResTime();
    const duration = end - start;
    samples.push(duration);
  }

  private static getHighResTime(): number {
    if (typeof process !== "undefined" && process.hrtime) {
      const [seconds, nanoseconds] = process.hrtime();
      return seconds * 1000 + nanoseconds / 1_000_000; 
    }
    return performance.now();
  }

  private static calculateMetrics(
    samples: number[],
    timedOut: boolean,
    confidence: number,
  ): BenchmarkMetrics {
    if (samples.length === 0) {
      return this.createEmptyMetrics(timedOut);
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const mean = this.calculateMean(samples);
    const stdDev = this.calculateStdDev(samples, mean);
    const confidenceInterval = this.calculateConfidenceInterval(
      mean,
      stdDev,
      samples.length,
      confidence,
    );

    const metrics: BenchmarkMetrics = {
      meanLatency: mean,
      medianLatency: this.percentile(sorted, 0.5),
      p95Latency: this.percentile(sorted, 0.95),
      stdDev,
      opsPerSecond: samples.length / (mean / 1000),
      confidenceInterval,
      samples: samples.length,
      timestamp: Date.now(),
      timedOut,
    };

    return metrics;
  }

  private static calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static calculateStdDev(values: number[], mean: number): number {
    const squaredDiffs = values.map((x) => Math.pow(x - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }

  private static percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }

  private static calculateConfidenceInterval(
    mean: number,
    stdDev: number,
    sampleSize: number,
    confidence: number,
  ): { lower: number; upper: number } {
    // Using t-distribution for small sample sizes
    const alpha = 1 - confidence;
    const tValue = this.getTValue(sampleSize - 1, alpha / 2);
    const margin = (tValue * stdDev) / Math.sqrt(sampleSize);

    return {
      lower: mean - margin,
      upper: mean + margin,
    };
  }

  private static getTValue(degreesOfFreedom: number, alpha: number): number {
    // Approximation of t-distribution critical values
    // This is a simplified implementation - for more accurate values,
    // you might want to use a statistical library
    const confidenceLevel = 1 - alpha * 2;
    if (confidenceLevel === 0.95) {
      if (degreesOfFreedom > 120) return 1.96;
      if (degreesOfFreedom > 60) return 2.0;
      if (degreesOfFreedom > 30) return 2.042;
      if (degreesOfFreedom > 15) return 2.131;
      return 2.262;
    }
    // Default to normal distribution approximation
    return 1.96;
  }

  private static createEmptyMetrics(timedOut: boolean): BenchmarkMetrics {
    return {
      meanLatency: 0,
      medianLatency: 0,
      p95Latency: 0,
      stdDev: 0,
      opsPerSecond: 0,
      confidenceInterval: { lower: 0, upper: 0 },
      samples: 0,
      timestamp: Date.now(),
      timedOut,
    };
  }

  private static validateOptions(
    options: BenchmarkOptions,
  ): Required<BenchmarkOptions> {
    if (options.iterations && options.iterations <= 0) {
      throw new Error("Iterations must be greater than 0");
    }
    if (
      options.confidence &&
      (options.confidence <= 0 || options.confidence >= 1)
    ) {
      throw new Error("Confidence must be between 0 and 1");
    }
    return options as Required<BenchmarkOptions>;
  }
}
