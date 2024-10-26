/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import path from "path";
import vm from "vm";
import { createRequire } from "module";
import { Process } from "./mocks";
import { ConsoleMock } from "./mocks";
import kleur from "../utils/kleur";
import { Formatter } from "../utils/Formatter";
import { Log } from "../utils/Log";

export class VM {
  private consoleMock: ConsoleMock;

  constructor(private file: string) {
    this.consoleMock = new ConsoleMock();
  }

  // Create the VM sandbox context
  public createSandbox(): vm.Context {
    const customRequire = createRequire(path.resolve(this.file));

    return vm.createContext({
      process: Process(this.file),
      console: this.consoleMock,
      require: customRequire,
      exports: exports,
      setInterval,
      setTimeout,
      clearInterval,
      clearTimeout,
      __filename: this.file,
      __dirname: path.dirname(this.file),
    });
  }

  // Run the code in an isolated VM
  public async executeScript(code: string): Promise<any> {
    const sandbox = this.createSandbox();
    const script = new vm.Script(code, { filename: this.file });
    Log.info(`Executing ${this.file} in isolated VM...`);
    return script.runInNewContext(sandbox);
  }

  // Replay logs from the console mock
  public replayLogs(): void {
    this.consoleMock.logs.forEach((log) => {
      const { method, args, stack } = log;
      console.log(kleur.blue(kleur.bold(`\nConsole.${method}()\n`)));
      {
        (console[method as keyof Console] as Function)(...args);
      }
      Formatter.parseStack(stack ?? "", 4, this.file);
    });
  }

  // Get the console mock instance
  public getConsoleMock(): ConsoleMock {
    return this.consoleMock;
  }
}