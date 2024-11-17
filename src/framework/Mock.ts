/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export type MockFunction<T extends (...args: any[]) => any> = T & {
  calls: Array<Parameters<T>>;
  results: Array<{
    type: "return" | "throw";
    value: any;
  }>;
  instances: any[];
  lastCall: Parameters<T> | undefined;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockResolvedValue: (value: any) => MockFunction<T>;
  mockRejectedValue: (value: any) => MockFunction<T>;
  mockRestore: () => void;
  mockReset: () => void;
  mockClear: () => void;
};

export class Mock {
  static fn<T extends (...args: any[]) => any>(
    implementation?: T,
  ): MockFunction<T> {
    let impl = implementation || ((() => undefined) as T);
    const mockState = {
      calls: [] as Array<Parameters<T>>,
      results: [] as Array<{
        type: "return" | "throw";
        value: any;
      }>,
      instances: [] as any[],
      lastCall: undefined as Parameters<T> | undefined,
    };

    function resetMockState(): void {
      mockState.calls = [];
      mockState.results = [];
      mockState.instances = [];
      mockState.lastCall = undefined;
    }

    function call(thisArg: any, ...args: Parameters<T>): ReturnType<T> {
      try {
        const result = impl.apply(thisArg, args);
        mockState.calls.push(args);
        mockState.instances.push(thisArg);
        mockState.lastCall = args;
        mockState.results.push({ type: "return", value: result });
        return result;
      } catch (error) {
        mockState.results.push({ type: "throw", value: error });
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
          case "mockImplementation":
            return (fn: T): MockFunction<T> => {
              impl = fn;
              return proxy as MockFunction<T>;
            };
          case "mockReturnValue":
            return (value: ReturnType<T>): MockFunction<T> => {
              impl = (() => value) as T;
              return proxy as MockFunction<T>;
            };
          case "mockResolvedValue":
            return (value: any): MockFunction<T> => {
              impl = (() => Promise.resolve(value)) as T;
              return proxy as MockFunction<T>;
            };
          case "mockRejectedValue":
            return (value: any): MockFunction<T> => {
              impl = (() => Promise.reject(value)) as T;
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
        }

        return Reflect.get(target, prop);
      },
    });

    return proxy as MockFunction<T>;
  }

  static isMocked(value: unknown): value is MockFunction<any> {
    if (typeof value !== "function") return false;

    try {
      // Try to access mock-specific properties and verify their types
      const fn = value as any;

      // Check for array properties
      if (!Array.isArray(fn.calls)) return false;
      if (!Array.isArray(fn.results)) return false;
      if (!Array.isArray(fn.instances)) return false;

      // Check for mock functions - verify they exist and are functions
      if (typeof fn.mockImplementation !== "function") return false;
      if (typeof fn.mockReturnValue !== "function") return false;
      if (typeof fn.mockResolvedValue !== "function") return false;
      if (typeof fn.mockRejectedValue !== "function") return false;
      if (typeof fn.mockRestore !== "function") return false;
      if (typeof fn.mockReset !== "function") return false;
      if (typeof fn.mockClear !== "function") return false;

      // If all checks pass, it's a mock
      return true;
    } catch {
      // If any property access throws (which can happen with Proxies),
      // we assume it's not a mock
      return false;
    }
  }
}
