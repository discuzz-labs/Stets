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

export function isPrimitive(value: unknown): boolean {
  return (
    value === null || // `null` is a primitive
    value === undefined || // `undefined` is a primitive
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  );
}
