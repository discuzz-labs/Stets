import "veve";
import { isFn } from "../dist/framework/Fn.js"

should("Test TrackFn utilities");

it("tracks function calls and arguments", () => {
  const trackedAdd = Fn((a: number, b: number) => a + b);

  trackedAdd(1, 2);
  trackedAdd(3, 4);

  assert(trackedAdd.getCallCount()).toBe(2);
  assert(trackedAdd.getCalls().length).toBe(2);

  assert(trackedAdd.getArgsForCall(0)).toEqual([1, 2]);
  assert(trackedAdd.getArgsForCall(1)).toEqual([3, 4]);

  assert(trackedAdd.wasCalledWith(1, 2)).toBe(true);
  assert(trackedAdd.wasCalledWith(5, 6)).toBe(false);
});

it("tracks return values", () => {
  const trackedMultiply = Fn((a: number, b: number) => a * b);

  trackedMultiply(2, 3);
  trackedMultiply(4, 5);

  const returnValues = trackedMultiply.getReturnValues();
  assert(returnValues).toEqual([6, 20]);
});

it("tracks exceptions thrown by the function", () => {
  const trackedErrorFn = Fn(() => {
    throw new Error("Test error");
  });

  try {
    trackedErrorFn();
  } catch (e) {
    // Ignore the thrown error in the test
  }

  const exceptions = trackedErrorFn.getExceptions();
  assert(exceptions.length).toBe(1);
  assert(exceptions[0].error.message).toBe("Error: Test error");
});

it("can return a specified value", () => {
  const trackedFn = Fn(() => 0);

  trackedFn.return(42);
  const result = trackedFn();

  assert(result).toBe(42);
});

it("can throw a specified error", () => {
  const trackedFn = Fn(() => 0);

  trackedFn.throw(new Error("Custom error"));

  try {
    trackedFn();
  } catch (e) {
    assert(e).toBeInstanceOf(Error);
    assert(e.message).toBe("Error: Custom error");
  }
});

it("can use a custom implementation", () => {
  const trackedFn = Fn(() => 0);

  trackedFn.use((x: number) => x * 2);

  const result = trackedFn(3);
  assert(result).toBe(6);
});

it("resets function tracking", () => {
  const trackedFn = Fn((x: number) => x);

  trackedFn(1);
  trackedFn(2);

  assert(trackedFn.getCallCount()).toBe(2);

  trackedFn.reset();

  assert(trackedFn.getCallCount()).toBe(0);
  assert(trackedFn.getCalls().length).toBe(0);
  assert(trackedFn.getExceptions().length).toBe(0);
  assert(trackedFn.getReturnValues().length).toBe(0);
});

it("spies on an object's method", () => {
  const obj = {
    multiply(a: number, b: number) {
      return a * b;
    },
  };

  const trackedMultiply = spyOn(obj, "multiply");

  obj.multiply(2, 3);
  obj.multiply(4, 5);

  assert(trackedMultiply.getCallCount()).toBe(2);
  assert(trackedMultiply.getReturnValues()).toEqual([6, 20]);
  assert(trackedMultiply.wasCalledWith(2, 3)).toBe(true);
});

it("checks if a value is a tracked function", () => {
  const trackedFn = Fn(() => 42);
  assert(isFn(trackedFn)).toBe(true);

  const normalFn = () => 42;
  assert(isFn(normalFn)).toBe(false);
});

run();
