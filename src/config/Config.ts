/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { join } from "path";
import { existsSync } from "fs";
import config from "../veve.config";

// Types
export type Veve = { pattern: string[]; exclude: string[]; reporters: string[]; };

export class Config {
  private config: Veve;

  constructor(configPath: string | undefined) {
    const path = join(process.cwd(), configPath as string)
    this.config = existsSync(path) ? require(path).default : config;
  }

  public get<K extends keyof Veve>(key: K): Veve[K] {
    return this.config[key];
  }
}
