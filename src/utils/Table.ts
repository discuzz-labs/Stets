/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { BenchmarkMetrics } from "../core/Bench";

export function Table(data: (BenchmarkMetrics | null | undefined)[]): string | void {
  if (!Array.isArray(data) || data.length === 0) return;

  const headers: { label: string; key: keyof BenchmarkMetrics }[] = [
    { label: "Throughput Avg", key: "throughputAvg" },
    { label: "Throughput Median", key: "throughputMedian" },
    { label: "Latency Avg", key: "latencyAvg" },
    { label: "Latency Median", key: "latencyMedian" },
    { label: "Samples", key: "samples" },
    { label: "Timestamp", key: "timestamp" },
  ];

  // Single-pass column width calculation and row generation
  const columnWidths: Record<keyof BenchmarkMetrics, number> = {} as Record<keyof BenchmarkMetrics, number>;
  const formattedRows: string[] = [];

  // Create header with initial column widths
  const header = headers.map(({ label, key }) => {
    columnWidths[key] = label.length;
    return label;
  }).join(" | ");

  // Process data rows in a single pass
  const dataRows = data.map(item => {
    return headers.map(({ key }) => {
      const value = item?.[key];
      const formattedValue = 
        typeof value === "number" 
          ? value.toFixed(2) 
          : String(value ?? "");

      // Update column width dynamically
      columnWidths[key] = Math.max(columnWidths[key], formattedValue.length);

      return formattedValue;
    });
  });

  // Format rows with final column widths
  const formattedDataRows = dataRows.map(row => 
    row.map((value, index) => 
      value.padEnd(columnWidths[headers[index].key])
    ).join(" | ")
  );

  // Create separator row
  const separator = headers
    .map(({ key }) => "-".repeat(columnWidths[key]))
    .join("-+-");

  // Combine all parts into the final table
  return [
    headers.map(({ label, key }) => label.padEnd(columnWidths[key])).join(" | "), 
    separator, 
    ...formattedDataRows
  ].join("\n") + "\n";
}