/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";

export class BuildError extends Error {
  constructor(
    public fileName: string,
    public error: string
  ) {
    super(); // Initialize the Error class
    this.fileName = fileName;
  }

  toString() {
    return (
      `\n${kleur.bgRed(" BUILD ERROR ")} at ${kleur.red(this.fileName)}\n` +
      this.error
    );
  }
}
