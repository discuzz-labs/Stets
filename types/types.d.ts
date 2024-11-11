export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

export interface ErrorMetadata {
  message: string | undefined;
  stack: string | undefined;
}

export interface Options {
  timeout?: number;
  skip?: boolean;
  if?: boolean | undefined | null | (() => boolean | Promise<boolean> | null | undefined);
}

export interface Test {
  description: string;
  fn: TestFunction;
  options: Options;
}

export interface Hook {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  fn: HookFunction;
  options: Options;
}

export type TestResult = {
  description: string;
  status: "passed" | "failed" | "skipped";
  error?: ErrorMetadata
};

export type HookResult = {
  description: "afterAll" | "afterEach" | "beforeAll" | "beforeEach";
  status: "passed" | "failed" | "skipped";
  error?: ErrorMetadata
};

export interface Stats {
  total: number;
  skipped: number;
  passed: number;
  failed: number;
}

export interface TestReport {
  stats: Stats;
  description: string;
  status: "passed" | "failed";
  tests: TestResult[];
  hooks: HookResult[];
}
