/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { EventEmitter } from "events";

export class Process extends EventEmitter {
  private process: any;

  constructor() {
    super();

    this.process = {
      process: this.clone(),

      Buffer,

      setTimeout,
      setInterval,
      clearInterval,
      clearTimeout,
      clearImmediate,
      setImmediate,

      exports: {},
    };
  }

  // Clone current process properties into a new object for VM context
  clone() {
    return {
      env: { ...process.env }, // Clone environment variables
      argv: [...process.argv], // Command-line arguments
      cwd: process.cwd(), // Current working directory
      exit: (code: number = 0) => this.emit("exit", code),
      on: process.on.bind(process),
      platform: process.platform,
    };
  }

  context() {
    return this.process;
  }
}
