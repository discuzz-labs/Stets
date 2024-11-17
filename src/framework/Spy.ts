import { deepEqual } from "../utils/index.js";

export interface SpyCall<T extends any[] = any[], R = any> {
  args: T;
  timestamp: Date;
  result: R;
}

export interface SpyException {
  error: Error;
  timestamp: Date;
}

interface SpyFunction<T extends any[] = any[], R = any> {
  (...args: T): R;
  spy: Spy<T, R>;
}

export class Spy<T extends any[] = any[], R = any> {
  private calls: SpyCall<T, R>[] = [];
  private returnValues: R[] = [];
  private exceptions: SpyException[] = [];
  private callCount = 0;

  // Create a spy on an existing method
  static spyOn<TObj extends object, TMethod extends keyof TObj>(
    obj: TObj,
    methodName: TMethod,
  ): Spy<
    TObj[TMethod] extends (...args: infer P) => any ? P : never,
    TObj[TMethod] extends (...args: any[]) => infer Q ? Q : never
  > {
    const originalMethod = obj[methodName];
    if (typeof originalMethod !== "function") {
      throw new Error(
        `Cannot spy on ${String(methodName)} - it's not a function`,
      );
    }

    const spy = new Spy<
      TObj[TMethod] extends (...args: infer P) => any ? P : never,
      TObj[TMethod] extends (...args: any[]) => infer Q ? Q : never
    >();

    (obj[methodName] as unknown) = function (this: any, ...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);
        spy.recordCall(
          args as TObj[TMethod] extends (...args: infer P) => any ? P : never,
          result,
        );
        return result;
      } catch (error) {
        spy.recordException(
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    };

    (obj[methodName] as SpyFunction<any, any>).spy = spy;
    return spy;
  }

  private recordCall(args: T, result: R): void {
    this.calls.push({
      args,
      timestamp: new Date(),
      result,
    });
    this.returnValues.push(result);
    this.callCount++;
  }

  private recordException(error: Error): void {
    this.exceptions.push({
      error,
      timestamp: new Date(),
    });
  }

  getCalls(): ReadonlyArray<SpyCall<T, R>> {
    return this.calls;
  }

  getCall(index: number): SpyCall<T, R> | undefined {
    return this.calls[index];
  }

  getLatestCall(): SpyCall<T, R> | undefined {
    return this.calls[this.calls.length - 1];
  }

  getCallCount(): number {
    return this.callCount;
  }

  getAllArgs(): ReadonlyArray<T> {
    return this.calls.map((call) => call.args);
  }

  getArgsForCall(index: number): T | undefined {
    const call = this.getCall(index);
    return call?.args;
  }

  getReturnValues(): ReadonlyArray<R> {
    return this.returnValues;
  }

  getExceptions(): ReadonlyArray<SpyException> {
    return this.exceptions;
  }

  wasCalled(): boolean {
    return this.callCount > 0;
  }

  wasCalledWith(...args: T): boolean {
    return this.calls.some(
      (call) =>
        call.args.length === args.length &&
        call.args.every((arg, index) => deepEqual(arg, args[index])),
    );
  }

  wasCalledTimes(n: number): boolean {
    return this.callCount === n;
  }

  reset(): void {
    this.calls = [];
    this.returnValues = [];
    this.exceptions = [];
    this.callCount = 0;
  }

  static isSpiedOn(value: unknown): value is SpyFunction<any, any> {
    try {
      const fn = value as any;

      // Check for the presence of spy-related properties
      if (!Array.isArray(fn.calls)) return false;
      if (!Array.isArray(fn.returnValues)) return false;
      if (!Array.isArray(fn.exceptions)) return false;
      if (typeof fn.callCount !== "number") return false;

      // Check for specific spy methods
      if (typeof fn.getCalls !== "function") return false;
      if (typeof fn.getCall !== "function") return false;
      if (typeof fn.getLatestCall !== "function") return false;
      if (typeof fn.getCallCount !== "function") return false;
      if (typeof fn.getAllArgs !== "function") return false;
      if (typeof fn.wasCalled !== "function") return false;
      if (typeof fn.wasCalledWith !== "function") return false;
      

      // If all checks pass, it's a valid spied function
      return true;
    } catch {
      return false;
    }
  }
}
