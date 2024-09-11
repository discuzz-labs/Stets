/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Test } from "../lib/Test"

export const defaultCmd = () => {
  new Test().run()
}