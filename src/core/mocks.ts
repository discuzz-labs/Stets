import { Console } from "console";
import path from "path";

// ConsoleMock class to capture logs in the VM context
export class ConsoleMock extends Console {
  logs: { method: string; args: any[]; stack?: string }[] = [];
  private timers: Map<string, number> = new Map();

  constructor() {
    super(process.stdout, process.stderr); // Required to extend Console class
  }

  private logMethod(method: string, args: any[]): void {
    const stack = new Error().stack; // Get the stack trace
    this.logs.push({ method, args, stack });
  }

  log(...args: any[]): void {
    this.logMethod("log", args);
  }

  info(...args: any[]): void {
    this.logMethod("info", args);
  }

  warn(...args: any[]): void {
    this.logMethod("warn", args);
  }

  error(...args: any[]): void {
    this.logMethod("error", args);
  }

  debug(...args: any[]): void {
    this.logMethod("debug", args);
  }

  trace(...args: any[]): void {
    this.logMethod("trace", args);
  }

  assert(...args: any[]): void {
    this.logMethod("assert", args);
  }

  clear(): void {
    this.logMethod("clear", []);
  }

  count(label?: string): void {
    this.logMethod("count", [label]);
  }

  countReset(label?: string): void {
    this.logMethod("countReset", [label]);
  }

  dir(value: any, options?: object): void {
    this.logMethod("dir", [value, options]);
  }

  dirxml(value: any): void {
    this.logMethod("dirxml", [value]);
  }

  group(...args: any[]): void {
    this.logMethod("group", args);
  }

  groupCollapsed(...args: any[]): void {
    this.logMethod("groupCollapsed", args);
  }

  groupEnd(): void {
    this.logMethod("groupEnd", []);
  }

  time(label?: string): void {
    this.timers.set(label || "default", Date.now());
    this.logMethod("time", [label]);
  }

  timeEnd(label?: string): void {
    const endTime = Date.now();
    const startTime = this.timers.get(label || "default");
    const duration = startTime ? endTime - startTime : 0;
    this.logMethod("timeEnd", [label, duration]);
  }

  timeLog(label?: string, ...args: any[]): void {
    this.logMethod("timeLog", [label, ...args]);
  }

  traceError(...args: any[]): void {
    this.logMethod("traceError", args);
  }

  // Add custom method for printing logs
  getLogs(): { method: string; args: any[]; stack?: string }[] {
    return this.logs;
  }

  // Reset timers
  resetTimers(): void {
    this.timers.clear();
  }
}

// Process

export function Process(mainFilePath: string) {
  // Shallow clone the main process object
  const newProcess = { ...process };

  const mainFileDir = path.dirname(mainFilePath);

  // Rewrite the mainModule.paths only
  if (newProcess.mainModule) {
    newProcess.mainModule.filename = mainFileDir;
    newProcess.mainModule.paths = [
      mainFileDir,
      path.join(mainFileDir, "node_modules"),
    ];
  }
  
  newProcess.env = {
    ...process.env,
    RUNNING: "true",
    ISTEST: "true"
  };

  return newProcess;
}

