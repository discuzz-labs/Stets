/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as fs from "fs";
import * as path from "path";
import { Reporter } from "./Reporter.js";
import { PoolResult } from "../core/Pool.js";
import { ErrorInspect } from "../core/ErrorInspect.js";
import kleur from "kleur";
import { XML } from "../utils/xml.js";

export interface junit extends Reporter {}

/**
 * Generates a JUnit XML report from the provided test results.
 *
 * @type {junit}
 */

export const junit: junit = {
  name: "junitReporter",
  type: "file",

  report: async function (options: {
    reports: Map<string, PoolResult>;
    outputDir: string;
  }) {
    const xml = new XML();
    xml.openTag("testsuites");

    for (const [
      file,
      { error, duration, report, sourceMap },
    ] of options.reports) {
      if (report) {
        xml.openTag("testsuite", {
          name: file,
          time: duration, // Convert duration to seconds.
          tests: report?.stats.total,
          failures: report?.stats.failed,
          skipped: report?.stats.skipped,
        });
        for (const test of report.tests) {
          xml.openTag("testcase", {
            name: test.description,
            classname: file,
            time: test.duration,
          });

          if (test.status === "failed" && test.error) {
            xml.openTag("failure", {
              message: ErrorInspect.format({
                error: test.error,
                file,
                sourceMap,
                noColor: true,
              }),
            });
            xml.closeTag("failure");
          }

          if (test.status === "skipped") {
            xml.selfClosingTag("skipped");
          }

          xml.closeTag("testcase");
        }
      }

      if (error) {
        xml.openTag("system-err");
        xml.tag("![CDATA[", error({ error, file }));
        xml.closeTag("system-err");
      }

      xml.closeTag("testsuite");
    }

    xml.closeTag("testsuites");

    // Write the XML report to the specified directory.
    const outputPath = path.join(options.outputDir, "junit-report.xml");
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, xml.toString(), "utf-8");

    console.log(`${kleur.green("✓")} JUnit report generated at ${outputPath}`);
  },
};
