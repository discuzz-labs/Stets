/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { performance } from "node:perf_hooks";

export interface BenchmarkOptions {
  iterations?: number;
  warmup?: number;
  timeout?: number;
}

export interface BenchmarkMetrics {
  throughputAvg: number;
  throughputMedian: number;
  latencyAvg: number;
  latencyMedian: number;
  samples: number;
  timestamp: number;
  timedOut: boolean; // Track if benchmark was forcibly stopped
}

export class Bench {
  private static readonly DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
    iterations: 1000,
    warmup: 100,
    timeout: 5000,
  };

  private static benchmarkResults: BenchmarkMetrics[] = [];

  static async run(
    fn: () => unknown | Promise<unknown>,
    options: BenchmarkOptions = {},
  ): Promise<BenchmarkMetrics> {
    // Validate and merge options
    const config = this.validateOptions({
      ...this.DEFAULT_OPTIONS,
      ...options,
    });

    const latencies: number[] = [];
    let timedOut = false;

    // Warmup phase
    for (let i = 0; i < config.warmup!; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      latencies.push(end - start);
    }

    // Benchmark phase with timeout handling
    const timeoutPromise = new Promise<BenchmarkMetrics>((_, reject) => {
      setTimeout(() => {
        timedOut = true;
      }, config.timeout!);
    });

    try {
      const promises = Array.from({ length: config.iterations! }, async () => {
        const start = performance.now();
        await fn();
        const end = performance.now();
        latencies.push(end - start);
      });

      await Promise.race([Promise.all(promises), timeoutPromise]);

      // Calculate metrics
      const throughputAvg = latencies.length / performance.now();
      const latencyAvg =
        latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const latencyMedian = this.median(latencies);

      const metrics: BenchmarkMetrics = {
        throughputAvg,
        throughputMedian: this.median(latencies),
        latencyAvg,
        latencyMedian,
        samples: latencies.length,
        timestamp: Date.now(),
        timedOut,
      };

      this.benchmarkResults.push(metrics);
      return metrics;
    } catch (error) {
      // Simply stop and return metrics without throwing errors
      return {
        throughputAvg: 0,
        throughputMedian: 0,
        latencyAvg: 0,
        latencyMedian: 0,
        samples: 0,
        timestamp: Date.now(),
        timedOut: true,
      };
    }
  }

  // Helper to calculate the median
  private static median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  // Option validation
  private static validateOptions(
    options: BenchmarkOptions,
  ): Required<BenchmarkOptions> {
    if (options.iterations && options.iterations <= 0) {
      throw new Error("Iterations must be greater than 0");
    }
    return options as Required<BenchmarkOptions>;
  }
}
