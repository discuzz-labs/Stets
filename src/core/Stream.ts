/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { build } from 'esbuild';
import { createReadStream } from 'fs';
import path from 'path';

export class Stream {
  private file: string;

  constructor(file: string) {
    this.file = file;
  }

  // Public method to read and transform the file
  public async processFile(): Promise<string> {
    try {
      const result = await this.bundleFile(this.file);
      return result;
    } catch (error) {
      console.error(`Error processing file ${this.file}:`, error);
      throw error;
    }
  }

  // Private method to bundle and transform the file using esbuild
  private async bundleFile(entryFile: string): Promise<string> {
    const result = await build({
      entryPoints: [entryFile],
      bundle: true, // Bundle all dependencies
      platform: 'node', // For Node.js environment
      format: 'cjs', // CommonJS output
      write: false, // Do not write to disk
      outdir: 'output', // Temporary output directory
      absWorkingDir: path.dirname(entryFile), // Base directory for resolving paths
      loader: {
        '.ts': 'ts', // Handle TypeScript files
      },
    });

    // Return the bundled code as a string
    return result.outputFiles[0].text;
  }
}