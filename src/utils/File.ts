/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */


import fs from 'fs';
import readline from 'readline'
import { Log } from './Log';

export class File {
  filePath: string;
  
  constructor(filePath: string){
    this.filePath = filePath;
  }

  /**
   * Reads a specific line from a file using streams
   * @param {number} lineNumber - The line number to read (1-based).
   * @returns {Promise<string | null>} - The content of the specified line, or null if not found.
   */
  public async readLine(lineNumber: number): Promise<string | null> {
    Log.info(`Reading line from file: ${this.filePath}`)
    const fileStream = fs.createReadStream(this.filePath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentLine = 0;

    for await (const line of rl) {
      currentLine += 1;

      if (currentLine === lineNumber) {
        rl.close(); // Stop reading further lines
        return line;
      }
    }
    Log.error(`Line ${lineNumber} not found in file: ${this.filePath}`)
    return null; // If line number is greater than total lines in file
  }

  public isExsiting(): boolean {
    Log.info(`Checking if file exists: ${this.filePath}`)
    return fs.existsSync(this.filePath)
  }
}