import { exec } from "child_process";

export function getType(value: unknown): string {
  return {}.toString.call(value).split(" ")[1].slice(0, -1).toLowerCase();
}

export function deepEqual(
  value1: any,
  value2: any,
  cache = new WeakMap(),
): boolean {
  // Check if both values are strictly equal (handles primitives and identical references)
  if (value1 === value2) return true;

  // Check if either is null or not an object (at this point we know they're not strictly equal)
  if (
    value1 === null ||
    value2 === null ||
    typeof value1 !== "object" ||
    typeof value2 !== "object"
  ) {
    return false;
  }

  // Use cache to avoid redundant comparisons
  if (cache.has(value1) && cache.get(value1) === value2) return true;
  cache.set(value1, value2);

  // Check if both are arrays
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) return false; // Different lengths
    // Compare each element
    return value1.every((item, index) => deepEqual(item, value2[index], cache));
  }

  // Check if both are plain objects
  if (!Array.isArray(value1) && !Array.isArray(value2)) {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);

    if (keys1.length !== keys2.length) return false; // Different number of keys

    // Compare each key-value pair
    return keys1.every((key) => deepEqual(value1[key], value2[key], cache));
  }

  // If one is an array and the other is not, they are not equal
  return false;
}

export function equal(
  value1: any,
  value2: any,
  cache = new WeakMap(),
): boolean {
  // Check if both values are strictly equal (handles primitives and identical references)
  if (value1 === value2) return true;

  // Check if either is null or not an object (at this point we know they're not strictly equal)
  if (
    value1 === null ||
    value2 === null ||
    typeof value1 !== "object" ||
    typeof value2 !== "object"
  ) {
    return false;
  }

  // Skip undefined values by checking if either value is undefined
  if (value1 === undefined || value2 === undefined) return true;

  // Use cache to avoid redundant comparisons
  if (cache.has(value1) && cache.get(value1) === value2) return true;
  cache.set(value1, value2);

  // Check if both are arrays
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) return false; // Different lengths
    // Compare each element, skip undefined values
    return value1.every((item, index) => item === undefined || equal(item, value2[index], cache));
  }

  // Check if both are plain objects
  if (!Array.isArray(value1) && !Array.isArray(value2)) {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);

    if (keys1.length !== keys2.length) return false; // Different number of keys

    // Compare each key-value pair, skip undefined values
    return keys1.every((key) => {
      if (value1[key] === undefined || value2[key] === undefined) return true;
      return equal(value1[key], value2[key], cache);
    });
  }

  return false; // If none of the above checks return, they are not equal
}

export function stripPath(path: string) {
  const cwd = process.cwd();

  if (path.startsWith(cwd)) {
    // Remove the current working directory and the following path separator
    return path.slice(cwd.length + 1);
  }
  return path;
}

export const isTs = exec('tsc --version', (error: any, stdout: any, stderr: any) => {
  if (error || stderr) {
    return false
  }
  return true
});
