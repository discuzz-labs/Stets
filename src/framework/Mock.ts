/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import { deepEqual } from "../utils/index.js"
import { Spy, SpyCall, SpyException } from "./Spy.js";

export type MockFunction<T extends (...args: any[]) => any> = T & {
  // Existing mock-specific method
  instances: any[];
  andReturn: (value: ReturnType<T>) => MockFunction<T>;
  andThrow: (error: Error) => MockFunction<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockRestore: () => void;
  mockReset: () => void;
  mockClear: () => void;

  // Spy-like
  calls: Array<SpyCall<Parameters<T>, ReturnType<T>>>;
  returnValues: ReturnType<T>[];
  exceptions: SpyException[];
  callCount: number;
  getCalls: () => ReadonlyArray<SpyCall<Parameters<T>, ReturnType<T>>>;
  getCall: (index: number) => SpyCall<Parameters<T>, ReturnType<T>> | undefined;
  getLatestCall: () => SpyCall<Parameters<T>, ReturnType<T>> | undefined;
  getCallCount: () => number;
  getAllArgs: () => ReadonlyArray<Parameters<T>>;
  getArgsForCall: (index: number) => Parameters<T> | undefined;
  getReturnValues: () => ReadonlyArray<ReturnType<T>>;
  getExceptions: () => ReadonlyArray<SpyException>;
  wasCalled: () => boolean;
  wasCalledWith: (...args: Parameters<T>) => boolean;
  wasCalledTimes: (n: number) => boolean;
};

export class Mock {
  static fn<T extends (...args: any[]) => any>(
    implementation?: T,
  ): MockFunction<T> {
    let impl = implementation || ((() => undefined) as T);
    const mockState = {
      calls: [] as Array<SpyCall<Parameters<T>, ReturnType<T>>>,
      returnValues: [] as ReturnType<T>[],
      exceptions: [] as SpyException[],
      instances: [] as any[],
      callCount: 0,
    };

    function resetMockState(): void {
      mockState.calls = [];
      mockState.returnValues = [];
      mockState.exceptions = [];
      mockState.instances = [];
      mockState.callCount = 0;
    }

    function call(thisArg: any, ...args: Parameters<T>): ReturnType<T> {
      try {
        const result = impl.apply(thisArg, args);
        const timestamp = new Date();
        mockState.calls.push({ args, timestamp, result });
        mockState.returnValues.push(result);
        mockState.instances.push(thisArg);
        mockState.callCount++;
        return result;
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
        const timestamp = new Date();
        mockState.exceptions.push({ error, timestamp });
        mockState.callCount++;
        throw error;
      }
    }

    const proxy = new Proxy(call, {
      apply: (target, thisArg, args: Parameters<T>): ReturnType<T> =>
        target(thisArg, ...args),
      get: (target, prop: string | symbol) => {
        // Direct access to mock state
        if (prop in mockState) {
          return mockState[prop as keyof typeof mockState];
        }

        // Direct access to mock methods
        switch (prop) {
          case "andReturn":
            return (value: ReturnType<T>): MockFunction<T> => {
              impl = (() => value) as T;
              return proxy as MockFunction<T>;
            };
          case "andThrow":
            return (error: Error): MockFunction<T> => {
              (impl as any) = () => {
                throw error;
              };
              return proxy as MockFunction<T>;
            };
          case "mockImplementation":
            return (fn: T): MockFunction<T> => {
              impl = fn;
              return proxy as MockFunction<T>;
            };
          case "mockRestore":
            return (): void => {
              resetMockState();
              impl = implementation || ((() => undefined) as T);
            };
          case "mockReset":
            return (): void => {
              resetMockState();
              impl = (() => undefined) as T;
            };
          case "mockClear":
            return (): void => {
              resetMockState();
            };

          // Spy-related methods
          case "getCalls":
            return (): ReadonlyArray<SpyCall<Parameters<T>, ReturnType<T>>> => {
              return mockState.calls;
            };
          case "getCall":
            return (
              index: number,
            ): SpyCall<Parameters<T>, ReturnType<T>> | undefined => {
              return mockState.calls[index];
            };
          case "getLatestCall":
            return (): SpyCall<Parameters<T>, ReturnType<T>> | undefined => {
              return mockState.calls[mockState.calls.length - 1];
            };
          case "getCallCount":
            return (): number => {
              return mockState.callCount;
            };
          case "getAllArgs":
            return (): ReadonlyArray<Parameters<T>> => {
              return mockState.calls.map((call) => call.args);
            };
          case "getArgsForCall":
            return (index: number): Parameters<T> | undefined => {
              const call = mockState.calls[index];
              return call?.args;
            };
          case "getReturnValues":
            return (): ReadonlyArray<ReturnType<T>> => {
              return mockState.returnValues;
            };
          case "getExceptions":
            return (): ReadonlyArray<SpyException> => {
              return mockState.exceptions;
            };
          case "wasCalled":
            return (): boolean => {
              return mockState.callCount > 0;
            };
          case "wasCalledWith":
            return (...args: Parameters<T>): boolean => {
              return mockState.calls.some(
                (call) =>
                  call.args.length === args.length &&
                  call.args.every((arg, index) => deepEqual(arg, args[index])),
              );
            };
          case "wasCalledTimes":
            return (n: number): boolean => {
              return mockState.callCount === n;
            };
        }

        return Reflect.get(target, prop);
      },
    });

    return proxy as MockFunction<T>;
  }

  static isMocked(value: unknown): value is MockFunction<any> {
    if (typeof value !== "function") return false;

    try {
      const fn = value as any;

      if (typeof fn.andReturn !== "function") return false;
      if (typeof fn.andThrow !== "function") return false;
      if (typeof fn.mockImplementation !== "function") return false;
      if (typeof fn.mockRestore !== "function") return false;
      if (typeof fn.mockReset !== "function") return false;
      if (typeof fn.mockClear !== "function") return false;

     if (!Spy.isSpiedOn(fn)) return false;
      return true;
    } catch {
      return false;
    }
  }
}
