/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Stats, TestCaseStatus } from "../framework/TestCase.js";
import kleur from "kleur";

export interface TestHeaderArgs {
  description: string;
  file?: string;
  duration?: number;
  status: TestCaseStatus | string;
  stats?: Stats;
}

export interface StatusColorMap {
  [key: string]: (text: string) => string;
}


export function formatTestStatisticsSummary(stats: Stats): string {
  const items = [
    stats.failed && kleur.red(`× ${stats.failed}`),
    stats.skipped && kleur.yellow(`- ${stats.skipped}`),
    stats.passed && kleur.green(`✓ ${stats.passed}`),
    stats.total && kleur.gray(`*: ${stats.total}`),
  ];
  return items.filter(Boolean).join(' ') || 'Empty';
}

export function formatTestStatus(testName: string, testStatus: TestCaseStatus): string {
  const statusColors = {
    pending: kleur.yellow('⋯'),
    empty: kleur.gray('-'),
    failed: kleur.red('×'),
    passed: kleur.green('✓'),
  };
  return `${statusColors[testStatus] || '-'} ${normalizeFilePath(testName)}`
}


export function testReportHeader({
  description,
  file = '',
  duration = 0,
  status,
  stats,
}: TestHeaderArgs): string {
  return `\n${formatTestStatus(file, status as TestCaseStatus)} → ${kleur.bold(description)} ${formatTestStatisticsSummary(stats!)} in ${duration}s\n`;
}


export function normalizeFilePath(filePath: string): string {
  const cwd = process.cwd();
  return filePath.startsWith(cwd) 
    ? filePath.slice(cwd.length + 1)  // Remove CWD and path separator
    : filePath;
}