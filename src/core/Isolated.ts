/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import vm from "vm";
import { Formatter } from "../utils/Formatter";
import { Reporter } from "../reporters/Reporter";

interface ScriptOptions {
  code: string;
  filename: string;
}

interface ExecOptions {
  filename: string;
  script: vm.Script;
  context: vm.Context;
}

export class Isolated {
  context(): vm.Context {
    return vm.createContext({});
  }

  script({ code, filename }: ScriptOptions) {
    return new vm.Script(code, {
      filename,
    });
  }

  exec({ filename, script, context }: ExecOptions) {
    try {
      return script.runInNewContext(context);
    } catch (err: any) {
      Reporter.reportTestFile(filename, 0)
      Formatter.formatError(err.message, err.stack, 15, filename);
    } 
      //console.log(`Test ${filename} didnot send any valid report. Call run() at the end of the file, please!`)
    
  }
}
