import "veve";
import { Bench, BenchmarkOptions, BenchmarkMetrics } from "../dist/core/Bench.js";

should("Test Bench class");

it("runs benchmark and returns valid metrics", async () => {
  const mockTestFunction = () => new Promise(resolve => setTimeout(resolve, 10)); // Simulates 10ms async operation
  const options: BenchmarkOptions = {
    iterations: 100,
    warmup: 10,
    timeout: 2000, // Set a reasonable timeout
  };

  const result: BenchmarkMetrics = await Bench.run(mockTestFunction, options);

  assert(result).toHaveProperty("throughputAvg");
  assert(result).toHaveProperty("throughputMedian");
  assert(result).toHaveProperty("latencyAvg");
  assert(result).toHaveProperty("latencyMedian");
  assert(result).toHaveProperty("samples");
  assert(result).toHaveProperty("timestamp");

  assert(result.samples).toBeGreaterThan(0);
  assert(result.latencyAvg).toBeGreaterThan(0);
  assert(result.throughputAvg).toBeGreaterThan(0);
});

it("handles synchronous functions correctly", async () => {
  const syncTestFunction = () => {}; // Simulates a synchronous function

  const result: BenchmarkMetrics = await Bench.run(syncTestFunction, {
    iterations: 50,
    warmup: 5,
    timeout: 1000,
  });

  assert(result).toHaveProperty("throughputAvg");
  assert(result).toHaveProperty("latencyAvg");

  assert(result.samples).toBeGreaterThan(0);
  assert(result.latencyAvg).toBeCloseTo(0); // Since the function is synchronous, latency should be minimal (close to 0)
});

it("stops benchmark when timeout is reached", async () => {
  const longTestFunction = () => new Promise(resolve => setTimeout(resolve, 100)); // Simulates 100ms async operation

  const result: BenchmarkMetrics = await Bench.run(longTestFunction, {
    iterations: 100,
    warmup: 10,
    timeout: 500, // Set a short timeout to test stopping early
  });
  const resultControll: BenchmarkMetrics = await Bench.run(longTestFunction, {
    iterations: 100,
    warmup: 10,
    timeout: 1000, // Set a short timeout to test stopping early
  });

  assert(result.samples).toBeGreaterThan(0);
  assert(result.timestamp).toBeDefined();

  assert(result.throughputAvg).toBeLessThan(resultControll.throughputAvg); // Expect lower throughput due to early stop
});

run();
