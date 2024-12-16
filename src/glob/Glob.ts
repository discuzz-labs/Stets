/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { readdir, stat } from "fs/promises";
import { resolve, join } from "path";
import { globToRegex } from "./globToRegex.js";

interface GlobOptions {
  files: string[] | undefined;
  exclude: string[];
  pattern: string[];
}

export function isValidFile(
  filePath: string,
  patterns: string[],
  excludes: string[],
): boolean {
  // Ignore files containing node_modules in their path
  if (filePath.includes("node_modules")) return false;

  // Convert patterns and excludes to regex
  const regexPatterns = patterns.map((pattern) => globToRegex(pattern));
  const regexExcludes = excludes.map((pattern) => globToRegex(pattern));

  // Check exclusions first
  const matchesExclude = regexExcludes.some((regex) => regex.test(filePath));
  if (matchesExclude) {
    return false;
  }

  const matchesPattern = regexPatterns.some((regex) => regex.test(filePath));
  return matchesPattern;
}

export class Glob {
  private maxFiles: number = 100_000; // Default max file limit
  private fileCount: number = 0;

  constructor(private readonly options: GlobOptions) {}

  async collect(): Promise<string[]> {
    const absoluteDir = process.cwd();
    const collected = await this.collectFiles(
      absoluteDir,
      this.options.pattern,
      this.options.exclude,
    );

    // Add explicitly specified files
    this.options.files?.forEach((file) => {
      const resolvedFile = resolve(file);
      if (
        isValidFile(resolvedFile, this.options.pattern, this.options.exclude)
      ) {
        collected.push(resolvedFile);
      }
    });

    if (collected.length === 0) {
      console.log(
        `No suites were found applying the following pattern(s): ${this.options.pattern} in the directory: ${process.cwd()} \n`,
      );
      process.exit(1);
    }

    return collected;
  }

  private async collectFiles(
    dir: string,
    patterns: string[],
    excludes: string[],
  ): Promise<string[]> {
    const results: string[] = [];
    const entries = await readdir(dir);

    await Promise.all(
      entries.map(async (entry) => {
        if (this.fileCount >= this.maxFiles) return; // Stop if maxFiles is reached
        const filePath = join(dir, entry);
        const stats = await stat(filePath);

        if (stats.isDirectory()) {
          // Skip node_modules directories
          if (!filePath.includes("node_modules")) {
            const nestedFiles = await this.collectFiles(
              filePath,
              patterns,
              excludes,
            );
            results.push(...nestedFiles);
          }
        } else if (isValidFile(filePath, patterns, excludes)) {
          this.fileCount++; // Increment the file count
          if (this.fileCount <= this.maxFiles) {
            results.push(resolve(filePath)); // Return absolute path
          }
        }
      }),
    );

    return results;
  }
}
