/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Config } from "../lib/Config";
import { File } from "./File"

export class TsConfig{
  static get(): string {
    const config = Config.getInstance()
    const tsconfigPath = config.getConfig("tsconfig")
    
    let tsconfigRaw = new File(tsconfigPath).readFile()
    if(!tsconfigRaw) {
      console.error("Error while loading tsConfig run with -v to see why")
      process.exit(1)
    }
    
    return tsconfigRaw
  }
}