import { TestCaseStatus } from '../framework/TestCase.js';
import { formatTestStatus } from '../utils/ui.js';

/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
export class Terminal {
  renderMap = new Map<string, TestCaseStatus>();

  draft(file: string, status: TestCaseStatus) {
    console.log(formatTestStatus(file, status));
  }
  // Function to render the current file statuses in the console
  render() {
    //console.clear(); // Clears the console
    this.renderMap.forEach((status, file) => {
      this.draft(file, status);
    });
  }

  // Function to update a file’s status and re-render the console
  update(file: string, status: TestCaseStatus) {
    const currentStatus = this.renderMap.get(file);
    if (currentStatus !== status) {
      this.renderMap.set(file, status);
    }
  }

  set(file: string, status: TestCaseStatus) {
    this.renderMap.set(file, status);
  }
}
