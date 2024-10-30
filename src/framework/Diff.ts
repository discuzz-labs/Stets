/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export interface DiffResult {
  path: Array<string | number>; // Path to the differing element, e.g., 'foo.bar[0].baz'
  expected: any; // The expected value at this path
  received: any; // The received value at this path
}

export class Diff {
  constructor(private visited: WeakSet<any> = new WeakSet()) {}

  public async compare(
    expected: any,
    received: any,
  ): Promise<Array<DiffResult>> {
    return await this.deepCompare(expected, received, []);
  }

  private async deepCompare(
    expected: any,
    received: any,
    path: Array<string | number>,
  ): Promise<Array<DiffResult>> {
    let differences: Array<DiffResult> = [];

    if (this.visited.has(expected) || this.visited.has(received)) {
      return differences; // Handle circular references
    }

    if (typeof expected === "object" && expected !== null)
      this.visited.add(expected);
    if (typeof received === "object" && received !== null)
      this.visited.add(received);

    if (Object.is(expected, received)) return differences;

    if (typeof expected !== typeof received) {
      differences.push({ path: [...path], expected, received });
      return differences;
    }

    if (Array.isArray(expected) && Array.isArray(received)) {
      await this.splitAndCompareArrays(expected, received, path, differences);
    } else if (
      typeof expected === "object" &&
      expected !== null &&
      received !== null
    ) {
      await this.splitAndCompareObjects(expected, received, path, differences);
    } else {
      differences.push({ path: [...path], expected, received });
    }

    return differences;
  }

  private async splitAndCompareArrays(
    expectedArr: any[],
    receivedArr: any[],
    path: Array<string | number>,
    differences: Array<DiffResult>,
  ) {
    const maxLength = Math.max(expectedArr.length, receivedArr.length);

    for (let i = 0; i < maxLength; i++) {
      if (i >= expectedArr.length) {
        differences.push({
          path: [...path, i],
          expected: undefined,
          received: receivedArr[i],
        });
      } else if (i >= receivedArr.length) {
        differences.push({
          path: [...path, i],
          expected: expectedArr[i],
          received: undefined,
        });
      } else {
        const diff = await this.deepCompare(expectedArr[i], receivedArr[i], [
          ...path,
          i,
        ]);
        differences.push(...diff);
      }
    }
  }

  private async splitAndCompareObjects(
    expectedObj: object,
    receivedObj: object,
    path: Array<string | number>,
    differences: Array<DiffResult>,
  ) {
    const keys1 = Object.keys(expectedObj);
    const keys2 = Object.keys(receivedObj);
    const allKeys = Array.from(new Set([...keys1, ...keys2]));

    const halfLength = Math.floor(allKeys.length / 2);
    const frontPart = Promise.all(
      allKeys.slice(0, halfLength).map(async (key) => {
        return this.deepCompare(
          (expectedObj as any)[key],
          (receivedObj as any)[key],
          [...path, key],
        ).then((res) => differences.push(...res));
      }),
    );

    const backPart = Promise.all(
      allKeys.slice(halfLength).map(async (key) => {
        return this.deepCompare(
          (expectedObj as any)[key],
          (receivedObj as any)[key],
          [...path, key],
        ).then((res) => differences.push(...res));
      }),
    );

    await Promise.all([frontPart, backPart]);
  }

  static setValueAtPath = (
    obj: any,
    path: Array<string | number>,
    value: any,
  ) => {
    path.slice(0, -1).reduce((acc, key) => {
      if (acc[key] === undefined) acc[key] = {};
      return acc[key];
    }, obj)[path[path.length - 1]] = value;
  };
}