/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";
import path from "path";

export class BaseReporter {
  onStart(file: string): string {
    const directoryPath = path.dirname(file);
    const fileName = path.basename(file);

    return `${kleur.bgYellow(" RUNNING ")} ${kleur.grey(directoryPath)}${kleur.black(`/${fileName}`)}`;
  }

  onTestFileReport(file: string, duration: number) {
    const fileName = path.basename(file);

    return `${kleur.underline(kleur.bold(fileName))} in ${kleur.gray(duration)} ms \n`;
  }

  onSuiteReport(description: string, passed: number, failed: number) {
    const total = passed + failed;
    return `${kleur.bgWhite(kleur.black(kleur.bold(description)))} ${kleur.gray("---")} ${
      failed === 0
        ? kleur.green(`(${total} / ${passed})`)
        : kleur.red(`(${total} / ${passed})`)
    }`;
  }

  onFail(description: string, error: string) {
    return `${kleur.bgRed(" FAILED ")} ${kleur.gray(description)} \n ${error} \n`;
  }

  onSummary(passed: number, failed: number, duration: number) {
    const total = passed + failed;
    return `\n Total: ${total} \n Passed: ${kleur.green(passed)} \n Duration: ${duration} \n ${kleur.gray("Ran all test files")}`;
  }
}
