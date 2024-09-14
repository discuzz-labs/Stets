/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
export class Test {
  constructor(
    public path: string,
    public status: 'pending' | 'running' | 'passed' | 'failed' = 'pending',
    public error: Error | null = null,
    public startTime: number | null = null,
    public endTime: number | null = null
  ) {}

  start() {
    this.status = 'running';
    this.startTime = Date.now();
  }

  pass() {
    this.status = 'passed';
    this.endTime = Date.now();
  }

  fail(error: Error) {
    this.status = 'failed';
    this.error = error;
    this.endTime = Date.now();
  }

  get duration() {
    return this.startTime && this.endTime ? this.endTime - this.startTime : null;
  }
}