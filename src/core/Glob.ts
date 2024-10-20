/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { readdir, stat } from "fs/promises";
import { resolve, join } from "path";
import { globToRegex } from "../utils/globToRegex";
import settings from "../constants/settings";

export class Glob {
    private excludePattern: RegExp[];
    private testDirectory: string | null;
    private patterns: RegExp[];
    private maxFiles: number = settings.MAX_TEST_FILES;
    private fileCount: number = 0; // Track the number of files found

    constructor({
        excludePattern = undefined,
        testDirectory = undefined,
        pattern = undefined,
        maxTestFiles = undefined, // Allow overriding the maximum number of files
    }: {
        excludePattern?: string | string[] | RegExp | RegExp[];
        testDirectory?: string;
        pattern?: string | string[] | RegExp | RegExp[];
        maxTestFiles?: number;
    } = {}) {
        // Set test directory (if provided, convert to absolute path)
        this.testDirectory = testDirectory ? resolve(testDirectory) : null;

        // Convert exclude patterns to an array of regex
        this.excludePattern = excludePattern
            ? Array.isArray(excludePattern)
                ? excludePattern.map((pattern) => globToRegex(pattern))
                : [globToRegex(excludePattern)]
            : [];

        // Convert patterns to an array of regex
        this.patterns = pattern
            ? Array.isArray(pattern)
                ? pattern.map((p) => globToRegex(p))
                : [globToRegex(pattern)]
            : [];

        // Set the maximum number of files (default to 1000)
        this.maxFiles = maxTestFiles ?? this.maxFiles;
    }

    /**
     * Parse a directory to collect matching files based on pattern and options.
     * @returns A promise that resolves to an array of absolute file paths.
     */
    async collect(): Promise<string[]> {
        const searchPattern = this.patterns
            ? Array.isArray(this.patterns)
                ? this.patterns.map(globToRegex)
                : [globToRegex(this.patterns)]
            : this.patterns;

        const absoluteDir = resolve(this.testDirectory || ".");
        console.log(absoluteDir);
        const collectedFiles = await this.collectFiles(absoluteDir, searchPattern);
        return collectedFiles;
    }

    /**
     * Recursively collect files matching the given pattern and options.
     * Stops when the maximum file count is reached.
     * @param dir - The directory to search within.
     * @param pattern - The file matching patterns (array of RegExps).
     * @returns A promise that resolves to an array of absolute file paths.
     */
    private async collectFiles(
        dir: string,
        pattern: RegExp[],
    ): Promise<string[]> {
        let results: string[] = [];
        const entries = await readdir(dir);

        await Promise.all(
            entries.map(async (entry) => {
                if (this.fileCount >= this.maxFiles) return; // Stop if maxFiles is reached

                const filePath = join(dir, entry);

                // Check if file should be excluded (including dotfiles/directories)
                if (this.shouldExclude(entry)) return;

                const stats = await stat(filePath);

                if (stats.isDirectory()) {
                    // Skip directories if not in the test directory
                    if (this.testDirectory && dir !== this.testDirectory)
                        return;

                    const nestedFiles = await this.collectFiles(filePath, pattern);
                    results.push(...nestedFiles);
                } else {
                    // Match the file against patterns
                    if (pattern.some((p) => p.test(entry))) {
                        this.fileCount++; // Increment the file count
                        if (this.fileCount <= this.maxFiles) {
                            results.push(resolve(filePath)); // Return absolute path
                        }
                    }
                }
            }),
        );

        return results;
    }

    /**
     * Helper function to check if a file matches the excluded pattern.
     * This method now also ignores dotfiles and dot directories.
     * @param entry - The file name.
     * @returns true if the file matches any excluded pattern or is a dotfile/directory.
     */
    private shouldExclude(entry: string): boolean {
        // Ignore dotfiles and dot directories
        if (entry.startsWith('.')) return true;

        // Check if the entry matches the exclude pattern
        return this.excludePattern.some((pattern) => pattern.test(entry));
    }
}
