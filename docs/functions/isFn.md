[**veve**](../README.md)

***

[veve](../globals.md) / isFn

# Function: isFn()

> **isFn**(`value`): `boolean`

Defined in: [framework/Fn.ts:349](https://github.com/tinytools-oss/veve/blob/be5b78158f59e7a302962ea6dd3ce70d92b54d39/src/framework/Fn.ts#L349)

Checks if a value is a tracked function.

## Parameters

### value

`any`

The value to check.

## Returns

`boolean`

True if the value is a tracked function, otherwise false.

## Example

```ts
const trackedAdd = Fn((a: number, b: number) => a + b);
console.log(isFn(trackedAdd)); // true
```
