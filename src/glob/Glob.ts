/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { readdir, stat } from "fs/promises";
import { resolve, join } from "path";
import { GlobBuilder } from "./GlobBuilder.js";

interface GlobOptions {
    files: string[] | undefined;
    exclude: string[];
    pattern: string[];
}

export class Glob {
    private maxFiles: number = 4000; // Default max file limit
    private fileCount: number = 0;
    private globBuilder = new GlobBuilder();

    constructor(private readonly options: GlobOptions) {}

    /**
     * Parse the current working directory to collect matching files based on patterns.
     * @returns A promise that resolves to an array of absolute file paths.
     */
    async collect(): Promise<string[]> {
        const absoluteDir = process.cwd();
        const regexPattern = this.options.pattern.map((p) =>
            this.globBuilder.convert(p),
        );
        const regexExclude = this.options.exclude.map((p) =>
            this.globBuilder.convert(p),
        );

        const collected = await this.collectFiles(
            absoluteDir,
            regexPattern,
            regexExclude,
        );
        this.options.files?.map((file) => collected.push(resolve(file)));

        if (collected.length === 0) {
            console.log(
                `No suites were found applying the following pattern(s): ${this.options.pattern} in the directory: ${process.cwd()} \n`,
            );
            process.exit(1);
        }

        return collected;
    }

    /**
     * Recursively collect files matching the given patterns and options.
     * Stops when the maximum file count is reached.
     * @param dir - The directory to search within.
     * @param pattern - The file matching patterns (array of RegExps).
     * @returns A promise that resolves to an array of absolute file paths.
     */
    private async collectFiles(
        dir: string,
        pattern: RegExp[],
        exclude: RegExp[],
    ): Promise<string[]> {
        let results: string[] = [];
        const entries = await readdir(dir);

        await Promise.all(
            entries.map(async (entry) => {
                if (this.fileCount >= this.maxFiles) return; // Stop if maxFiles is reached

                const filePath = join(dir, entry);

                // Check if file should be excluded (including dotfiles/directories)
                if (this.shouldExclude(exclude, entry)) return;

                const stats = await stat(filePath);

                if (stats.isDirectory()) {
                    const nestedFiles = await this.collectFiles(
                        filePath,
                        pattern,
                        exclude,
                    );
                    results.push(...nestedFiles);
                } else if (pattern.some((p) => p.test(entry))) {
                    this.fileCount++; // Increment the file count
                    if (this.fileCount <= this.maxFiles) {
                        results.push(resolve(filePath)); // Return absolute path
                    }
                }
            }),
        );

        return results;
    }

    /**
     * Helper function to check if a file matches the excluded pattern.
     * This method also ignores dotfiles and dot directories.
     * @param entry - The file name.
     * @returns true if the file matches any excluded pattern or is a dotfile/directory.
     */
    private shouldExclude(exclude: RegExp[], entry: string): boolean {
        // Ignore dotfiles and dot directories
        if (entry.startsWith(".") || entry === "node_modules") return true;

        // Check if the entry matches the exclude pattern
        return exclude.some((pattern) => pattern.test(entry));
    }
}
