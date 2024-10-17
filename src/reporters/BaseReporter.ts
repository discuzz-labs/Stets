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

    console.log(
      `${kleur.bgYellow(" RUNNING ")} ${kleur.gray(directoryPath)}${kleur.black(`/${fileName}`)}`,
    );
  }

  onTestFileReport(file: string, duration: number) {
    const fileName = path.basename(file);
    const directoryPath = path.dirname(file)
    console.log(
      `\n${kleur.underline(kleur.bold(fileName))} at ${kleur.gray(directoryPath)} in ${kleur.gray(duration)} ms \n`,
    );
  }

  onSuiteReport(
    description: string,
    passed: number,
    failed: number,
    indentation: number = 0,
  ) {
    const total = passed + failed;
    const indent = " ".repeat(indentation); // Add indentation

    console.log(
      `${indent}${kleur.bgWhite(kleur.black(kleur.bold(description)))} ${kleur.gray("---")} ${
        failed === 0
          ? kleur.green(`(${total} / ${passed})`)
          : kleur.red(`(${total} / ${passed})`)
      }`,
    );
  }

  async onFail(
    description: string,
    error: {
      message: string;
      stack: string;
    },
    indentation: number = 0,
  ) {
    const indent = " ".repeat(indentation); // Add indentation

    console.log(
      `\n${indent}${kleur.bgRed(" FAILED ")} ${kleur.bgBlack(kleur.white(description))}\n`,
    );
    const formattedError = await new ErrorFormatter().format(
      error.message,
      error.stack,
    );

    // Add indentation to each line of the formatted error
    const indentedError = formattedError
      .split("\n")
      .map((line) => indent + line)
      .join("\n");

    console.log(indentedError);
  }

  onSummary(passed: number, failed: number, duration: number) {
    const total = passed + failed;

    console.log(`
Total: ${total} 
Passed: ${kleur.green(passed)} 
Duration: ${duration} 
${kleur.gray("Ran all test files")}
`);
  }
}
