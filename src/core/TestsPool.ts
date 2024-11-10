/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Loader } from "../core/Loader";
import { Isolated } from "../core/Isolated";
import { Formatter } from "../utils/Formatter";
import { Reporter } from "../reporters/Reporter";
import { Console, replay } from "./Console"

export class TestsPool {
  private loader: Loader;

  constructor(private files: string[]) {
    this.loader = new Loader();
  }

  // Runs all tests in parallel
  public async runTests(): Promise<void> {
    await Promise.all(
      this.files.map(async (file) => {
        

        const console = new Console()

        const { code, filename } = this.loader.require(file);

        if (code === null || filename === null)
          throw new Error(`Could not load ${file}`);

        const start = Date.now();
        
        const isolated = new Isolated(filename);

        const script = isolated.script(code);

        const context = isolated.context({
          console: console
        });

        const execResult = await isolated.exec({ script, context });
        
        const end = Date.now();

        if (execResult.status && execResult.report) {
          Reporter.report(end - start, file, execResult.report);
        } else {
          Formatter.formatError(execResult.error?.message as string, execResult.error?.stack as string, 10, file)
        }

        replay(console.logs)
      }),
    );
  }
}
