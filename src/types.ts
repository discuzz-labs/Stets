/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
export type TestFunction = () => Promise<void> | void;
export type TestConfig = {
  description: string;
  fn: TestFunction;
}