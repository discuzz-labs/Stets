/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";

export class BuildError extends Error {
  public path: string;
  constructor({ path, message }: { path: string; message: string }) {
    super(message); // Initialize the Error class
    this.path = path;
  }

  toString() {
    return (
      `\n${kleur.bgRed(" BUIlD ERROR ")} at ${kleur.red(this.path)}\n` +
      this.message
    );
  }
}
