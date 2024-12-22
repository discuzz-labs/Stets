import "veve";
import {
  Bench,
  BenchmarkOptions,
  BenchmarkMetrics,
} from "../src/core/Bench.ts";

should("Test Bench");

it("runs benchmark and returns valid metrics", async () => {
  const mockTestFunction = () =>
    new Promise((resolve) => setTimeout(resolve, 10));

  const options: BenchmarkOptions = {
    iterations: 100,
    warmup: 10,
    timeout: 2000,
    confidence: 0.95,
  };

  const result: BenchmarkMetrics = await Bench.run(mockTestFunction, options);

  // Check all required properties exist
  assert(result).toHaveProperty("meanLatency");
  assert(result).toHaveProperty("medianLatency");
  assert(result).toHaveProperty("p95Latency");
  assert(result).toHaveProperty("stdDev");
  assert(result).toHaveProperty("opsPerSecond");
  assert(result).toHaveProperty("confidenceInterval");
  assert(result).toHaveProperty("samples");
  assert(result).toHaveProperty("timestamp");
  assert(result).toHaveProperty("timedOut");

  // Verify numeric values are reasonable
  assert(result.samples).toBeGreaterThan(0);
  assert(result.meanLatency).toBeGreaterThan(0);
  assert(result.p95Latency).toBeGreaterThan(0);
  assert(result.opsPerSecond).toBeGreaterThan(0);

  // Check confidence interval
  assert(result.confidenceInterval.lower).toBeLessThan(
    result.confidenceInterval.upper,
  );
  assert(result.meanLatency).toBeBetween(
    result.confidenceInterval.lower,
    result.confidenceInterval.upper,
  );

  // Since we're testing a 10ms operation
  assert(result.meanLatency).toBeBetween(5, 20); // Allow some variance
});

it("handles synchronous functions correctly", async () => {
  const syncTestFunction = () => {
    // Small computation to avoid JIT optimization
    let x = 0;
    for (let i = 0; i < 100; i++) x += i;
    return x;
  };

  const result: BenchmarkMetrics = await Bench.run(syncTestFunction, {
    iterations: 50,
    warmup: 5,
    timeout: 1000,
    confidence: 0.95,
  });

  assert(result.samples).toBeGreaterThan(0);
  assert(result.meanLatency).toBeGreaterThan(0);
  assert(result.opsPerSecond).toBeGreaterThan(0);
  assert(result.p95Latency).toBeGreaterThan(0);
  assert(result.stdDev).toBeGreaterThanOrEqual(0);

  // Sync operations should be faster than async ones
  assert(result.meanLatency).toBeLessThan(5);
});

it("stops benchmark when timeout is reached", async () => {
  const longTestFunction = () =>
    new Promise((resolve) => setTimeout(resolve, 100));

  const result: BenchmarkMetrics = await Bench.run(longTestFunction, {
    iterations: 100,
    warmup: 10,
    timeout: 100,
    confidence: 0.95,
  });

  assert(result.samples).toBeGreaterThan(0);
  assert(result.timestamp).toBeDefined();
  assert(result.timedOut).toBe(true);

  // Even with timeout, existing measurements should be valid
  assert(result.meanLatency).toBeGreaterThan(0);
  assert(result.medianLatency).toBeGreaterThan(0);
  assert(result.p95Latency).toBeGreaterThan(0);
});

it("produces consistent statistical measures", async () => {
  const consistentFunction = () =>
    new Promise((resolve) => setTimeout(resolve, 50));

  const result = await Bench.run(consistentFunction, {
    iterations: 50,
    warmup: 5,
    timeout: 5000,
    confidence: 0.95,
  });

  // For a consistent timing, median should be close to mean
  const meanMedianDiff = Math.abs(result.meanLatency - result.medianLatency);
  assert(meanMedianDiff).toBeLessThan(10);

  // P95 should be greater than mean
  assert(result.p95Latency).toBeGreaterThan(result.meanLatency);

  // Standard deviation should be relatively small for consistent timing
  assert(result.stdDev).toBeLessThan(result.meanLatency / 2);
});

run();
