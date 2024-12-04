/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { performance } from 'node:perf_hooks';
import { TestFunction } from '../framework/TestCase';

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
}

export class Bench {
  private static readonly DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
    iterations: 1000,
    warmup: 100,
    timeout: 5000,
  };

  private static benchmarkResults: BenchmarkMetrics[] = [];

  static async run(
    fn: TestFunction,
    options: BenchmarkOptions = {},
  ): Promise<BenchmarkMetrics> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const latencies: number[] = [];
    const isAsync = fn.constructor.name === 'AsyncFunction';

    // Warmup phase
    for (let i = 0; i < config.warmup; i++) {
      if (isAsync) {
        void (await fn()); // Use void to explicitly ignore the return value
      } else {
        void fn(); // Use void for synchronous functions too
      }
    }

    const startTime = performance.now();
    const endTimeLimit = startTime + config.timeout;

    // Actual benchmark
    for (let i = 0; i < config.iterations; i++) {
      const iterStart = performance.now();

      try {
        if (isAsync) {
          void (await fn()); // Use void to explicitly ignore the return value
        } else {
          void fn(); // Use void for synchronous functions too
        }
      } catch (error) {
        console.error(`Benchmark error in ${name}:`, error);
        break;
      }

      const iterEnd = performance.now();
      const latency = (iterEnd - iterStart) * 1_000_000; // Convert to nanoseconds
      latencies.push(latency);

      // Break if timeout is reached
      if (performance.now() > endTimeLimit) break;
    }

    // Calculate statistics
    const samples = latencies.length;
    const latenciesSort = [...latencies].sort((a, b) => a - b);

    const latencyAvg = latencies.reduce((a, b) => a + b, 0) / samples;
    const latencyMedian = this.calculateMedian(latenciesSort);

    const totalTime = performance.now() - startTime;
    const throughputAvg = (samples / totalTime) * 1000;

    const throughputSort = [...latencies].sort((a, b) => a - b);
    const throughputMedian =
      samples / (this.calculateMedian(throughputSort) / 1000);

    const result: BenchmarkMetrics = {
      throughputAvg,
      throughputMedian,
      latencyAvg,
      latencyMedian,
      samples,

      timestamp: Date.now(),
    };

    // Store the result
    this.benchmarkResults.push(result);

    return result;
  }

  /**
   * Calculate median of a sorted array
   * @param sortedArray Sorted array of numbers
   * @returns Median value
   */
  private static calculateMedian(sortedArray: number[]): number {
    const mid = Math.floor(sortedArray.length / 2);
    return sortedArray.length % 2 !== 0
      ? sortedArray[mid]
      : (sortedArray[mid - 1] + sortedArray[mid]) / 2;
  }

  /**
   * Find the best-performing benchmark from the results
   * @param metric Metric to compare (default: throughputAvg)
   * @returns Best benchmark result
   */
  static getBestResult(
    metric: keyof BenchmarkMetrics = 'throughputAvg',
  ): BenchmarkMetrics | undefined {
    return this.benchmarkResults.reduce(
      (best, current) =>
        !best || current[metric] > best[metric] ? current : best,
      undefined as BenchmarkMetrics | undefined,
    );
  }
}
