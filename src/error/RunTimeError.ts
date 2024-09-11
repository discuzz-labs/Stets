/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { StetsError } from "../error/StetsError"

export class RunTimeError extends StetsError {
    constructor() {
      super("A runtime error has occured", 'RUNTIME', undefined);
    }
}