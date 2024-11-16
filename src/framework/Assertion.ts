/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "../utils/kleur.js";
import { Difference } from "./Diff.js";

class AssertionError extends Error {
  constructor(message: any, methodName: string) {
    const header =
      kleur.gray("expect" + "(expected)" + ".") +
      kleur.bold(methodName) +
      kleur.gray("(received)") +
      "\n\n" +
      kleur.bgRed("+ Expected") +
      "\n" +
      kleur.bgGreen("- Received") +
      "\n\n";

    super(header + message);
    this.name = "AssertionError";
  }
}

function toBe(expected: any, diff: Difference) {
  return function (received: any) {
    const diffrences = diff.formatDiff(expected, received);
    if (diffrences) throw new AssertionError(diffrences, "toBe");
  };
}

export function expect(expectation: any) {
  const diff = new Difference();

  return {
    toBe: toBe(expectation, diff),
  };
}
