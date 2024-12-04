/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from 'kleur';

export interface LogEntry {
  type: string;
  args: any[];
}

export class Console {
  logs: LogEntry[] = [];
  counts: { [key: string]: number } = {};
  timers: { [key: string]: number } = {};

  private manageTimer(action: 'start' | 'end', timerName: string) {
    if (action === 'start') {
      this.timers[timerName] = Date.now();
    } else if (action === 'end') {
      if (this.timers[timerName]) {
        const duration = Date.now() - this.timers[timerName];
        this.logs.push({
          type: 'timeEnd',
          args: [timerName, `${duration}ms`],
        });

        delete this.timers[timerName];
      }
    }
  }

  private createMethod(type: string) {
    return (...args: any[]) => {
      if (type === 'time') {
        this.manageTimer('start', args[0] || 'defaultTimer');
      } else if (type === 'timeEnd') {
        this.manageTimer('end', args[0] || 'defaultTimer');
      } else {
        this.logs.push({ type, args });
      }
    };
  }

  log(...args: any[]) {
    return this.createMethod('log')(...args);
  }

  warn(...args: any[]) {
    return this.createMethod('warn')(...args);
  }

  error(...args: any[]) {
    return this.createMethod('error')(...args);
  }

  info(...args: any[]) {
    return this.createMethod('info')(...args);
  }

  debug(...args: any[]) {
    return this.createMethod('debug')(...args);
  }

  table(...args: any[]) {
    return this.createMethod('table')(...args);
  }

  clear() {
    return this.createMethod('clear')();
  }

  time(...args: any[]) {
    return this.createMethod('time')(...args);
  }

  timeEnd(...args: any[]) {
    return this.createMethod('timeEnd')(...args);
  }

  assert(condition: any, ...args: any[]) {
    if (!condition) {
      this.createMethod('error')('Assertion failed:', ...args);
    }
  }

  count(args: any = 'default') {
    this.createMethod('count')(...args);
  }

  countReset(args: any = 'default') {
    this.createMethod('countReset')(...args);
  }

  group(args: any[]) {
    this.createMethod('group')(...args);
  }

  groupEnd() {
    this.createMethod('groupEnd')();
  }

  groupCollapsed(args: any[]) {
    this.createMethod('groupCollapsed')(...args);
  }

  trace(args: any[]) {
    this.createMethod('trace')(...args);
  }
}

export function replay(logs: LogEntry[]) {
  for (const log of logs) {
    const { type, args } = log;
    let header = kleur.blue('Console.' + type + '()');

    // Color coding for different log types
    if (type === 'log') header = kleur.gray('Console.log()');
    if (type === 'warn') header = kleur.yellow('Console.warn()');
    if (type === 'error') header = kleur.red('Console.error()');

    console.log(header);

    if (type === 'timeEnd')
      console.log(kleur.gray(args[0] + ' took ' + args[1]));
    else if (type === 'clear') console.log('Clear was called');
    else (console as any)[type](...args);
  }
}
