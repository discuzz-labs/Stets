/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export function Table(data: any[], columns?: string[]) {
  // If no columns specified, use all keys from first object
  const allColumns = columns || Object.keys(data[0] || {});

  // Calculate max width for each column
  const columnWidths = allColumns.reduce((widths, col) => {
    widths[col] = Math.max(
      col.length, 
      ...data.map(item => String(item[col] || '').length)
    );
    return widths;
  }, {} as Record<string, number>);

  // Create header
  const header = allColumns
    .map(col => col.padEnd(columnWidths[col]))
    .join(' | ');

  // Create separator
  const separator = allColumns
    .map(col => '-'.repeat(columnWidths[col]))
    .join('-+-');

  // Create rows
  const rows = data.map(item => 
    allColumns
      .map(col => String(item[col] || '').padEnd(columnWidths[col]))
      .join(' | ')
  );

  // Combine all parts
  return [header, separator, ...rows].join('\n') + "\n"
}