/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { diffTrimmedLines } from "diff";
import kleur from "kleur";
import { format } from "pretty-format";

export function diff(received: any, expected: any) {
  const formattedReceived = format(received, {
    printFunctionName: true,
  });
  const formattedExpected = format(expected, {
    printFunctionName: true,
  });

  const diff = diffTrimmedLines(formattedExpected, formattedReceived, {
    ignoreWhitespace: true,
  });

  let diffFormatted = `${kleur.bgRed("- Expected")}\n${kleur.bgGreen("+ Received")}\n\n`;
  let hasDiffs = false;

  diff.forEach((part) => {
    if (part.added || part.removed) {
      hasDiffs = true; // Mark that differences exist
    }

    const diffParts = part.added
      ? kleur.bgGreen(" + ") +
        part.value.replace(/([^\s])/g, kleur.bgGreen("$1"))
      : part.removed
        ? kleur.bgRed(" - ") + part.value.replace(/([^\s])/g, kleur.bgRed("$1"))
        : part.value;
    diffFormatted += diffParts;
  });

  return { diffFormatted, hasDiffs };
}
