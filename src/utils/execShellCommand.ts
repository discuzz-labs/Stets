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
    const cmdProcess = spawn(cmd[0], cmd.slice(1), { stdio: 'pipe', env: {
      ...process.env, FORCE_COLOR: "1"
    } });

    let output = ''; // To capture both stdout and stderr

    // Capture stdout
    cmdProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Capture stderr
    cmdProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    // Handle process close
    cmdProcess.on('close', (code) => {
      if (code !== 0) {
        reject(output.trim()); // Resolve all the output, even with errors
      } else {
        resolve(output.trim());
      }
    });
  });
}