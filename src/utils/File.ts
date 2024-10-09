/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */


import fs from 'fs';
import path from 'path';
import { Log } from './Log';

export class File {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public isExisting(): boolean {
    Log.info(`Checking if file exists: ${this.filePath}`);
    return fs.existsSync(this.filePath);
  }

  public writeFile(data: string): void {
    try {
      // Get the directory name from the file path
      const dirName = path.dirname(this.filePath);

      // Check if the directory exists; if not, create it
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
        Log.info(`Created directory: ${dirName}`);
      }

      fs.writeFileSync(this.filePath, data);
      Log.info(`Successfully written report to file: ${this.filePath}`);
    } catch (error) {
      Log.error(`Failed to write report to file: ${this.filePath}. Error: ${error}`);
    }
  }
}