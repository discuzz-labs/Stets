import * as vm from "vm";
import * as path from "path";
import { createRequire } from "module";
import { Fn, spyOn } from "../framework/Fn.js";
import { is, assert } from "../framework/Assertion.js";
import TestCase from "../framework/TestCase.js";

export class Context {
  private context: any;
  constructor() {

    this.context = {
      process: this.process(),
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
  private process() {
    return {
      env: { ...process.env },
      argv: [...process.argv],
      cwd: process.cwd(),
      on: process.on.bind(process),
      platform: process.platform
    };
  }

  add(context: any) {
    this.context = { ...context, ...this.context };

    return this;
  }

  // Create a VM context with testing utilities
  VMContext(file: string) {
    const testCase = new TestCase("Unnamed test");

    this.context = {
      assert,
      Fn,
      is,
      spyOn,
      bench: testCase.bench.bind(testCase),
      it: testCase.it.bind(testCase),
      fail: testCase.fail.bind(testCase),
      sequence: testCase.sequence.bind(testCase),
      timeout: testCase.timeout.bind(testCase),
      todo: testCase.todo.bind(testCase),
      retry: testCase.retry.bind(testCase),
      itIf: testCase.itIf.bind(testCase),
      should: testCase.should.bind(testCase),
      only: testCase.only.bind(testCase),
      skip: testCase.skip.bind(testCase),
      each: testCase.each.bind(testCase),
      beforeEach: testCase.beforeEach.bind(testCase),
      beforeAll: testCase.beforeAll.bind(testCase),
      run: testCase.run.bind(testCase),
      require: createRequire(file),
      __filename: path.basename(file),
      __dirname: path.dirname(file),
    }

    return this;
  }

  get(): vm.Context {
    return vm.createContext(this.context);
  }
}
