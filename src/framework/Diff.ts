/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { diffWords } from "diff";
import { Format } from "../utils/Format.js";
import kleur from "../utils/kleur.js";

export class Diff {
  diff;

  constructor(received: any, expected: any) {
    const formattedReceived = new Format().format(received);
    const formattedExpected = new Format().format(expected);
    this.diff = diffWords(formattedExpected, formattedReceived, {
      ignoreWhitespace: true,
    });
  }

  has() {
    return this.diff.length > 0;
  }

  format() {
    let diffFormatted = "";
    this.diff.forEach((part) => {
      // green for additions, red for deletions
      let diff = part.added
        ? kleur.bgGreen(" + ") +
          part.value.replace(/([^\s])/g, kleur.bgGreen("$1"))
        : part.removed
          ? kleur.bgRed(" - ") +
            part.value.replace(/([^\s])/g, kleur.bgRed("$1"))
          : part.value;
      diffFormatted += diff;
    });

    return diffFormatted;
  }
}
