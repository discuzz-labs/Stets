import Suite from "../index";
import { Diff } from "./Diff";
import assert from "assert";

const suite = new Suite();

suite.describe("Diff Class Comparison Tests", () => {
  suite.it("should find no differences for identical primitives", async () => {
    const diff = new Diff();
    const result = await diff.compare(42, 42);
    assert.deepStrictEqual(result, []);
  });

  suite.it("should detect differences between two different primitives", async () => {
    const diff = new Diff();
    const result = await diff.compare(42, 43);
    assert.deepStrictEqual(result, [
      { path: [], expected: 42, received: 43 }
    ]);
  });

  suite.it("should find differences in nested objects", async () => {
    const diff = new Diff();
    const obj1 = { a: 1, b: { c: 3 } };
    const obj2 = { a: 1, b: { c: 4 } };

    const result = await diff.compare(obj1, obj2);
    assert.deepStrictEqual(result, [
      { path: ["b", "c"], expected: 3, received: 4 }
    ]);
  });

  suite.it("should find differences in arrays with varying lengths", async () => {
    const diff = new Diff();
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 4, 5];

    const result = await diff.compare(arr1, arr2);
    assert.deepStrictEqual(result, [
      { path: [2], expected: 3, received: 4 },
      { path: [3], expected: undefined, received: 5 }
    ]);
  });
});

suite.run();