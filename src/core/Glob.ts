import { readdir, stat } from "fs/promises";
import { resolve, join } from "path";
import { globToRegex } from "../utils/globToRegex";

// Define options for the Glob class
interface GlobOptions {
    ignoreDotFiles?: boolean;
    excludedPattern?: string | RegExp | RegExp[] | null;
    ignore?: string[];
    filesOnly?: boolean;
    searchInOneFolder?: string; // The folder where we can search
    filePattern?: string | RegExp | RegExp[]; // Glob patterns for file matching
}

export class Glob {
    private ignoreDotFiles: boolean;
    private excludedPattern: RegExp | RegExp[] | null;
    private ignores: RegExp[];
    private filesOnly: boolean;
    private searchInOneFolder: string | null;
    private filePatterns: RegExp[];

    constructor({
        ignoreDotFiles = false,
        excludedPattern = null,
        ignore = [],
        filesOnly = true,
        searchInOneFolder = undefined,
        filePattern = undefined,
    }: GlobOptions = {}) {
        // Store options and initialize the relevant properties
        this.ignoreDotFiles = ignoreDotFiles;
        this.filesOnly = filesOnly;
        this.searchInOneFolder = searchInOneFolder
            ? resolve(searchInOneFolder)
            : null; // Absolute path if provided
        this.excludedPattern = excludedPattern
            ? Array.isArray(excludedPattern)
                ? excludedPattern.map(globToRegex)
                : globToRegex(excludedPattern)
            : null;

        // Combine default ignored directories and user-defined ones
        this.ignores = ["^.git", "node_modules"]
            .concat(ignore)
            .concat(ignoreDotFiles ? ["^\\..*"] : []) // Option to ignore dot files
            .map(globToRegex);

        // Convert filePattern to regex array
        this.filePatterns = filePattern
            ? Array.isArray(filePattern)
                ? filePattern.map(globToRegex)
                : [globToRegex(filePattern)]
            : [];
    }

    /**
     * Parse a directory to collect matching files based on pattern and options.
     * @param dir - The directory to search within.
     * @param pattern - The file matching pattern (string, RegExp, or an array of RegExps).
     * @returns A promise that resolves to an array of absolute file paths.
     */
    async parse(
        dir: string,
        pattern?: string | RegExp | RegExp[],
    ): Promise<string[]> {
        // Set the file matching pattern (use default if not provided)
        const searchPattern = pattern
            ? Array.isArray(pattern)
                ? pattern.map(globToRegex)
                : [globToRegex(pattern)]
            : this.filePatterns;

        // Start file collection from the given directory
        const absoluteDir = resolve(dir || ".");
        return this.collectFiles(absoluteDir, searchPattern);
    }

    /**
     * Recursively collect files matching the given pattern and options.
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

        // Process each directory/file entry
        await Promise.all(
            entries.map(async (entry) => {
                const filePath = join(dir, entry);

                // Skip ignored files or directories
                if (this.shouldIgnore(entry)) return;

                const stats = await stat(filePath);

                if (stats.isDirectory()) {
                    // If searching in one folder, skip directories outside the search folder
                    if (
                        this.filesOnly ||
                        (this.searchInOneFolder &&
                            dir !== this.searchInOneFolder)
                    )
                        return;

                    // Recurse into directories
                    const nestedFiles = await this.collectFiles(
                        filePath,
                        pattern,
                    );
                    results.push(...nestedFiles);
                } else {
                    // Exclude files based on excludedPattern
                    if (this.shouldExclude(entry)) return;

                    // Match the file against patterns
                    if (pattern.some((p) => p.test(entry))) {
                        results.push(resolve(filePath)); // Return absolute path
                    }
                }
            }),
        );

        return results;
    }

    /**
     * Helper function to check if a file or directory should be ignored.
     * @param entry - The file or directory name.
     * @returns true if the entry matches any ignore pattern.
     */
    private shouldIgnore(entry: string): boolean {
        return this.ignores.some((ignorePattern) => ignorePattern.test(entry));
    }

    /**
     * Helper function to check if a file matches the excluded pattern.
     * @param entry - The file name.
     * @returns true if the file matches any excluded pattern.
     */
    private shouldExclude(entry: string): boolean {
        if (!this.excludedPattern) return false;
        if (Array.isArray(this.excludedPattern)) {
            return this.excludedPattern.some((pattern) => pattern.test(entry));
        } else {
            return this.excludedPattern.test(entry);
        }
    }
}
