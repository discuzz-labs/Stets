/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

type LogEntry = { type: string; args: any[]; timestamp: Date };

export class Console {
    logs: LogEntry[] = [];
    timers: { [key: string]: number } = {};
    
    private createMethod(type: string) {
        return (...args: any[]) => {
            const timestamp = new Date();

            // Handle timing methods specifically
            if (type === 'time') {
                // Start a timer
                const timerName = args[0] || 'defaultTimer';
                this.timers[timerName] = Date.now();
            } else if (type === 'timeEnd') {
                // End a timer and log the elapsed time
                const timerName = args[0] || 'defaultTimer';
                if (this.timers[timerName]) {
                    const duration = Date.now() - this.timers[timerName];
                    this.logs.push({ type: 'timeLog', args: [timerName, `${duration}ms`], timestamp });
                    delete this.timers[timerName]; // Remove timer
                } else {
                    console.warn(`Timer "${timerName}" not found.`);
                }
            } else if (type === 'timeLog') {
                // Log a message with the timer name
                this.logs.push({ type, args, timestamp });
            } else {
                // For standard console methods
                this.logs.push({ type, args, timestamp });
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

    timeLog(...args: any[]) {
        return this.createMethod('timeLog')(...args);
    }
}

export function replay(logs: LogEntry[]) {
      for (const log of logs) {
          const { type, args, timestamp } = log;
          console.log(`[${timestamp.toISOString()}] ${type}:`, ...args); // Include timestamp in replay
      }
  }