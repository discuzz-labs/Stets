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

  public writeJson(data: object): void {
    try {
      // Get the directory name from the file path
      const dirName = path.dirname(this.filePath);

      // Check if the directory exists; if not, create it
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
        Log.info(`Created directory: ${dirName}`);
      }

      // Convert the data to JSON format
      const jsonData = JSON.stringify(data, null, 2); // Pretty print with 2 spaces

      // Write the JSON data to the file
      fs.writeFileSync(this.filePath, jsonData);
      Log.info(`Successfully written JSON to file: ${this.filePath}`);
    } catch (error) {
      Log.error(`Failed to write JSON to file: ${this.filePath}. Error: ${error}`);
    }
  }
}