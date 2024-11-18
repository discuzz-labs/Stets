import { prettyFormat } from "../utils/PrettyFormat.js";

export class AssertionMessages {
  private isNot: boolean;

  // Constructor to initialize the isNot flag
  constructor(isNot: boolean) {
    this.isNot = isNot;
  }

  // Format for type check
  type({
    received,
    expected,
  }: {
    received: any;
    expected: string;
  }) {
    return `Expected ${prettyFormat(received)} ${this.isNot ? "not " : ""}to be of type ${expected}`;
  }

  // Format for instance check
  instance({
    received,
    expected,
  }: {
    received: any;
    expected: Function;
  }) {
    return `Expected ${prettyFormat(received)} ${this.isNot ? "not " : ""}to be an instance of ${expected.name}`;
  }

  // Format for comparison
  comparison({
    received,
    expected,
    comparison,
  }: {
    received: any;
    expected: any;
    comparison: string;
  }) {
    return `Expected ${prettyFormat(received)} ${this.isNot ? "not " : ""}${comparison} ${prettyFormat(expected)}`;
  }

  // Format for property check
  property({
    received,
    prop,
    value,
  }: {
    received: any;
    prop: string;
    value: any;
  }) {
    return `Expected ${prettyFormat(received)} ${this.isNot ? "not " : ""}to have property "${prop}"${
      value !== undefined ? ` with value ${prettyFormat(value)}` : ""
    }`;
  }

  // Format for mock call check
  mockCall({
    received,
    action,
    expected,
    callCount = 0,
    args = [],
  }: {
    received: any;
    action: string;
    expected: any;
    callCount?: number;
    args?: any[];
  }) {
    const formattedArgs =
      args.length > 0 ? args.map((arg: any) => prettyFormat(arg)) : [];

    return this.isNot
      ? args.length > 0
        ? `Expected ${prettyFormat(received)} ${action} with arguments ${formattedArgs.join(", ")}, but it was not called with these arguments.`
        : `Expected ${prettyFormat(received)} ${action} ${expected}, but it was called ${callCount} times.`
      : args.length > 0
        ? `Expected ${prettyFormat(received)} ${action} with arguments ${formattedArgs.join(", ")}, but it was called ${callCount} times with different arguments.`
        : `Expected ${prettyFormat(received)} ${action} ${expected}, but it was called ${callCount} times.`;
  }

  // Format for mock return value check
  mockReturn({
    received,
    action,
    expected,
    returnCount = 0,
    args = [],
  }: {
    received: any;
    action: string;
    expected: any;
    returnCount?: number;
    args?: any[];
  }) {
    const formattedArgs =
      args.length > 0 ? args.map((arg: any) => prettyFormat(arg)) : [];

    return this.isNot
      ? args.length > 0
        ? `Expected ${prettyFormat(received)} ${action} with return values ${formattedArgs.join(", ")}, but it did not return these values.`
        : `Expected ${prettyFormat(received)} ${action} ${expected}, but it was returned ${returnCount} times.`
      : args.length > 0
        ? `Expected ${prettyFormat(received)} ${action} with return values ${formattedArgs.join(", ")}, but it was returned ${returnCount} times with different values.`
        : `Expected ${prettyFormat(received)} ${action} ${expected}, but it was returned ${returnCount} times.`;
  }
}