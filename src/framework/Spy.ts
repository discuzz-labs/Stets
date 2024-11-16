export class Spy {
  private callCount: number = 0;
  private calls: Array<{ args: any[], result: any }> = [];

  // Method to spy on a function or method
  static spyOn(fn: Function): Spy {
    const spy = new Spy();
    const original = fn;

    fn = (...args: any[]) => {
      spy.callCount++;
      const result = original.apply(fn, args);
      spy.calls.push({ args, result });
      return result;
    };

    return spy;
  }

  // Method to get the number of times the function was called
  getCallCount(): number {
    return this.callCount;
  }

  // Method to get all calls made to the function
  getCalls(): Array<{ args: any[], result: any }> {
    return this.calls;
  }

  // Method to clear call history
  clearCalls(): void {
    this.callCount = 0;
    this.calls = [];
  }

  // Method to spy on an object's method
  static spyOnObjectMethod(obj: any, methodName: string): Spy {
    const spy = new Spy();
    const originalMethod = obj[methodName];

    obj[methodName] = (...args: any[]) => {
      spy.callCount++;
      const result = originalMethod.apply(obj, args);
      spy.calls.push({ args, result });
      return result;
    };

    return spy;
  }
}