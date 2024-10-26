/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { transform } from '@swc/core';
import { createReadStream } from 'fs';

export class Stream {
  private file: string;

  constructor(file: string) {
    this.file = file;
  }

  // Public method to read and transform the file
  public async processFile(): Promise<string> {
    try {
      // Read file using stream and process it efficiently
      const code = await this.readFileStream(this.file);
      const transformedCode = await this.transformCode(code);

      return transformedCode.code;
    } catch (error) {
      console.error(`Error processing file ${this.file}:`, error);
      throw error;
    }
  }

  // Private method to read the file using a stream (efficient for large files)
  private async readFileStream(file: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let fileContent = '';

      const readStream = createReadStream(file, { encoding: 'utf-8' });
      readStream.on('data', (chunk) => {
        fileContent += chunk;
      });

      readStream.on('end', () => {
        resolve(fileContent);
      });

      readStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  // Private method to transform the code using SWC
  private async transformCode(code: string): Promise<{ code: string }> {
    return transform(code, {
      filename: this.file,
      sourceMaps: true,
      isModule: true,
      module: {
        type: "commonjs",
      },
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
        },
        transform: {},
      },
    });
  }
}