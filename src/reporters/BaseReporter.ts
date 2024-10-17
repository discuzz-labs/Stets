/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { ErrorFormatter } from "../utils/ErrorFormatter";
import kleur from "../utils/kleur";
import path from "path";

export class BaseReporter {
  onStart(file: string) {
    const directoryPath = path.dirname(file);
    const fileName = path.basename(file);

    process.stdout.write(
      `${kleur.bgYellow(" RUNNING ")} ${kleur.gray(directoryPath)}${kleur.black(`/${fileName}`)} \n`,
    );
  }

  onTestFileReport(file: string, duration: number) {
    const fileName = path.basename(file);

    process.stdout.write(
      `${kleur.underline(kleur.bold(fileName))} in ${kleur.gray(duration)} ms \n\n`,
    );
  }

  onSuiteReport(description: string, passed: number, failed: number) {
    const total = passed + failed;
    process.stdout.write(
      `${kleur.bgWhite(kleur.black(kleur.bold(description)))} ${kleur.gray("---")} ${
        failed === 0
          ? kleur.green(`(${total} / ${passed})`)
          : kleur.red(`(${total} / ${passed})`)
      }\n`,
    );
  }

  onFail(
    description: string,
    error: {
      message: string;
      stack: string;
    },
  ) {
    process.stdout.write(
      `\n${kleur.bgRed(" FAILED ")} ${kleur.bgBlack(kleur.white(description))}\n`,
    );
    new ErrorFormatter().format(error.message, error.stack);
  }

  onSummary(passed: number, failed: number, duration: number) {
    const total = passed + failed;
    process.stdout.write(`
\nTotal: ${total} \nPassed: ${kleur.green(passed)} \nDuration: ${duration} \n${kleur.gray("Ran all test files")}
`);
  }
}
