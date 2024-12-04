/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from 'kleur';

export class AssertionError extends Error {
  constructor(message: any, methodName: string) {
    const header =
      kleur.gray('assert' + '(expected)' + '.') +
      kleur.bold(methodName) +
      kleur.gray('(received)') +
      '\n\n';
    super(header + message);
    this.name = 'AssertionError';
  }
}
