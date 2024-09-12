/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */


import { spawn } from 'child_process';

/**
 * Executes a shell command using spawn and returns the result as a Promise.
 * @param cmd {string[]} - The command and its arguments as an array.
 * @return {Promise<void>} - Resolves when the command completes successfully; otherwise, rejects with an error.
 */
export default function execShellCommand(cmd: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(cmd[0], cmd.slice(1), { stdio: 'pipe' });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0 || stderr) {
        reject(stderr.trim());  // Handle or suppress stderr as needed
      } else {
        resolve(stdout.trim());
      }
    });
  });
}