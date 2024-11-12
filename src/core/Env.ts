/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export class Env {
  constructor(private readonly envs: string[]){}
  
  public load() {
    if(this.envs.length > 0) {
      dotenv.config({ path: this.envs });
      return;
    }
    const cwd = process.cwd()
    
    // List all files in the root directory
    const files = fs.readdirSync(cwd);

    // Filter for files that start with `.env` (e.g., `.env`, `.env.local`, `.env.production`)
    const envFiles = files.filter((file) => file.startsWith(".env"));

    // Load each .env file in the root directory
    dotenv.config({ path: envFiles.map((file) => path.join(cwd, file)) });
  }
}
