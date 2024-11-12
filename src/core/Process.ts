/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { EventEmitter } from "events";
import TestCase from "../framework/TestCase";

export class Process extends EventEmitter {
  private process: any;
  
  constructor() {
    super();

    const testCase = new TestCase("Unnamed test");
    
    this.process ={
      process: this.clone(),

      Buffer,

      it: testCase.it.bind(testCase),
      fail: testCase.fail.bind(testCase),
      retry: testCase.retry.bind(testCase),
      itIf: testCase.itIf.bind(testCase),
      should: testCase.should.bind(testCase),
      only: testCase.only.bind(testCase),
      skip: testCase.skip.bind(testCase),
      each: testCase.each.bind(testCase),
      beforeEach: testCase.beforeEach.bind(testCase),
      beforeAll: testCase.beforeAll.bind(testCase),
      run: testCase.run.bind(testCase),

      setTimeout,
      setInterval,
      clearInterval,
      clearTimeout,
      clearImmediate,
      setImmediate,

      exports: {},
    }
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
    return this.process
  }
}
