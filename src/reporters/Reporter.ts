/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { TestReport } from "../framework/TestCase";
import { BaseReporter } from "./BaseReporter";

export class Reporter {
  static report(duration: number, file: string, report: TestReport) {
    BaseReporter.case(file, duration, report);

    const result = [...report.tests, report.hooks];
    
    result.forEach((t: any) => {
      if (t.status === "failed" && t.error) {
        BaseReporter.fail(t.description, t.error, file);
      } else if (t.status === "passed") {
        BaseReporter.success(t.description);
      } else if(t.status === "skipped") {
        BaseReporter.skipped(t.description);
      }
    });
    
  }
}
