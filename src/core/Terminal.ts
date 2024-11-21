import path from "path";
import { TestCaseStatus } from "../framework/TestCase.js";
import kleur from "../utils/kleur.js";
import { Reporter } from "../reporters/Reporter.js";

/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
export class Terminal {
  renderMap = new Map<string, TestCaseStatus>();

  draft(file: string, status: TestCaseStatus) {
    const dirPath = path.dirname(file);
    const fileName = path.basename(file);

    console.log(
      Reporter.status(fileName, status) +
        " " +
        kleur.gray(dirPath) +
        "/" +
        kleur.white(fileName),
    );
  }
  // Function to render the current file statuses in the console
  render() {
    console.clear(); // Clears the console
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
