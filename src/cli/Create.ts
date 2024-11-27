/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import kleur from "../utils/kleur.js";

export class Create {
  private readonly filePath: string;
  private readonly runtime: "ts" | "js";

  constructor(
    private readonly options: {
      runtime: "ts" | "js";
      file: string;
      basePath?: string;
    },
  ) {
    if (this.options.runtime !== "ts" && this.options.runtime !== "js") {
      console.error(kleur.red("🚀 Runtime options must be 'ts' or 'js'. Use -rt=js or -rt=ts"));
      process.exit(1);
    }

    // Construct the full file path
    this.filePath = path.join(
      options.basePath || process.cwd(),
      `${options.file}.test.${options.runtime}`,
    );
    this.runtime = options.runtime;

    // Display environment message
    console.log(
      `🚀 Runtime: ${this.options.runtime === "ts" ? kleur.blue("Typescript") : kleur.yellow("Javascript")}`,
    );
    this.createTestFile();
  }

  // Create the test file if it doesn't exist
  private createTestFile(): void {
    if (!fs.existsSync(this.filePath)) {
      // Create directories if they do not exist
      this.createDirectories();

      // Create the test file
      fs.writeFileSync(this.filePath, this.generateBoilerplate(), "utf8");

      console.log(kleur.green(`🌱 Successfully planted a new test file at ${kleur.bold(this.filePath)}!`));
    } else {
      console.log(kleur.yellow(`🍂 Oops! The file already exists at ${kleur.bold(this.filePath)}. No need to plant again.`));
    }
  }

  // Create directories if they don't exist
  private createDirectories(): void {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      console.log(kleur.cyan(`🔧 Created the necessary directories to plant the test file!`));
    } catch (error: any) {
      console.error(kleur.red(`❌ Failed to create directories: ${error.message}`));
      process.exit(1);
    }
  }

  // Generate boilerplate for the test file based on options
  private generateBoilerplate(): string {
    // Determine type assertion syntax based on runtime
    const typeAssertionSyntax = this.runtime === "ts" ? ": number" : "";
    const importStatement =
      this.runtime === "ts"
        ? 'import type { type } from "veve"'
        : '/** @typedef {import("veve").type} */';

    // Generate test boilerplate
    const testBoilerplate = `${importStatement}
should("${this.options.file} Suite")

it('should work correctly', () => {
  const testValue${typeAssertionSyntax} = 42;
  assert(testValue).toEqual(42);
});

it('should be named correctly', () => {
  assert('${this.options.file}').toBeString();
});

run();
`;

    return testBoilerplate;
  }
}
