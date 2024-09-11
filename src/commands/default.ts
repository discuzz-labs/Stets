/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Test } from "../lib/Test"
import { exec } from 'child_process';
import { glob } from 'glob';

export const defaultCmd = async () => {
  const testFiles = await glob("**/*.test.ts", { ignore: 'node_modules/**' })

  const tests = testFiles.map(file => new Test(file));

  await Promise.all(
    tests.map(async (test) => {
      try {
        test.start();
        exec(`ts-node ${test.name}`);
        test.pass();
        
      } catch (error) {
        test.fail(error as Error);
        
        
      }
    })
  );

 tests.forEach(test => {
    console.log(
      `${test.name}: ${test.status} in ${test.duration}ms`
    );
  });

  const passedTests = tests.filter(test => test.status === 'passed').length;
  const failedTests = tests.filter(test => test.status === 'failed').length;

  console.log(`\nSummary: ${passedTests} passed, ${failedTests} failed`);

  process.exit(0)
}