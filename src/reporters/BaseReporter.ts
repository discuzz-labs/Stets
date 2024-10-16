/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";
import path from "path";
import { consola } from "consola"

export class BaseReporter {
  onStart(file: string) {
    const directoryPath = path.dirname(file);
    const fileName = path.basename(file);

    console.log(`${kleur.bgYellow(" RUNNING ")} ${kleur.grey(directoryPath)}${kleur.black(`/${fileName}`)}`)
  }

  onTestFileReport(file: string, duration: number) {
    const fileName = path.basename(file);

    console.log(`${kleur.underline(kleur.bold(fileName))} in ${kleur.gray(duration)} ms \n`)
  }

  onSuiteReport(description: string, passed: number, failed: number) {
    const total = passed + failed;
    console.log(`${kleur.bgWhite(kleur.black(kleur.bold(description)))} ${kleur.gray("---")} ${
      failed === 0
        ? kleur.green(`(${total} / ${passed})`)
        : kleur.red(`(${total} / ${passed})`)
    }`)
  }

  onFail(description: string, error: string, stack?: string) {
    console.log(`${kleur.bgRed(" FAILED ")} ${kleur.gray(description)}`)
    const e = new Error(error);
    e.stack = stack
    consola.error(e)
  }

  onSummary(passed: number, failed: number, duration: number) {
    const total = passed + failed;
    console.log(`\n Total: ${total} \n Passed: ${kleur.green(passed)} \n Duration: ${duration} \n ${kleur.gray("Ran all test files")}`)
  }
}
