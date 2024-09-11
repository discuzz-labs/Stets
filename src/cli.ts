/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Command } from 'commander';
import { defaultCmd } from './commands/default';

const program = new Command();

program
  .version('1.0.0')
  .description('A TypeScript native testing framework')

program.action(defaultCmd)


program.parse(process.argv);