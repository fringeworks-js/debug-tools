# @fringeworks/debug-tools

`@fringeworks/debug-tools` is a library some will find handy, offering tools for measuring and observing how a program behaves during development.

**[日本語のREADMEはこちら](./README.ja.md)**

## Installation

```bash
npm install @fringeworks/debug-tools
# or
pnpm add @fringeworks/debug-tools
```

## Usage

Functions and types can be imported by the same name from the root or from a per-function path. A per-function path also provides its function as the default export.

```ts
import { measureTime } from '@fringeworks/debug-tools';
import measureTime from '@fringeworks/debug-tools/measureTime';
```

---

## API

| Function                         | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| `compareTime(options)`           | Measures and compares the execution time of several functions        |
| `compareTimeAsync(options)`      | Measures and compares the execution time of several async functions  |
| `measureTime(fn, options?)`      | Runs a function a number of times and measures the time taken        |
| `measureTimeAsync(fn, options?)` | Runs an async function a number of times and measures the time taken |

### `compareTime`

```ts
compareTime<A extends unknown[] = unknown[], R = unknown>(options: CompareTimeOptions<A, R>): CompareTimeResult<A, R>
```

Measures and compares the execution time of the functions in `targets`. Each round runs every function `iterations` times and records the time, and this is repeated for `rounds` rounds. The order of the functions changes every round to reduce bias from running order. Within a round, every function receives the same arguments.

An error is thrown if two `targets` share the same `id`.

```ts
const result = compareTime({
  targets: [
    { id: 'spread', fn: (a: number[]) => [...a] },
    { id: 'slice', fn: (a: number[]) => a.slice() },
  ],
  args: [Array.from({ length: 1000 }, (_, i) => i)],
  iterations: 100,
  rounds: 10,
});
result.order.map((target) => target.id); // fastest first
```

| Option              | Type                        | Description                                                                                                              |
| ------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `targets`           | `CompareTimeTarget<A, R>[]` | The functions to measureTime, as `{ id, fn }`. Each `id` must be unique                                                  |
| `iterations?`       | `number`                    | How many times each function runs per round. Decimals are truncated, and values below 1 become 1. Defaults to `10`       |
| `rounds?`           | `number`                    | How many rounds to measureTime. Decimals are truncated, and values below 1 become 1. Defaults to `10`                    |
| `args?`             | `A`                         | The arguments passed to the functions                                                                                    |
| `getArgs?`          | `() => A`                   | A function that creates the arguments for each run. Takes precedence over `args`. Same as `measureTime`                  |
| `warmUpIterations?` | `number`                    | How many times each function runs before measuring. Decimals are truncated, and values below 0 become 0. Defaults to `0` |
| `id?`               | `string`                    | An ID included in the result as is. Defaults to the start time in milliseconds                                           |

| Property       | Type                        | Description                                                         |
| -------------- | --------------------------- | ------------------------------------------------------------------- |
| `average`      | `ElapsedTimes`              | The average time per round for each function (ms)                   |
| `totalAverage` | `number`                    | The average time over all functions (ms). `0` if `targets` is empty |
| `order`        | `CompareTimeTarget<A, R>[]` | The targets sorted from the shortest average time                   |
| `results`      | `ElapsedTimes[]`            | The time of each function in each round                             |
| `returnValues` | `{ [id: string]: R }`       | The last return value of each function                              |
| `start`        | `Date`                      | When the measurement started                                        |
| `end`          | `Date`                      | When the measurement ended                                          |
| `id`           | `string`                    | The measurement ID                                                  |

### `compareTimeAsync`

```ts
compareTimeAsync<A extends unknown[] = unknown[], R = unknown>(options: CompareTimeAsyncOptions<A, R>): Promise<CompareTimeAsyncResult<A, R>>
```

The async-function version of `compareTime`. The functions are run one at a time, including the warm-up. The options and the result are the same as `compareTime`.

### `measureTime`

```ts
measureTime<R>(fn: () => R, options?: MeasureTimeOptions<[]>): MeasureTimeResult<R>
measureTime<A extends unknown[], R>(fn: (...args: A) => R, options: MeasureTimeOptions<A>): MeasureTimeResult<R>
```

Runs `fn` `iterations` times and returns the total execution time (ms) and the last return value. The time is measured with `performance.now()`. Because some environments reduce the precision of `performance.now()`, all runs are measured together rather than one by one.

If `fn` has required parameters, either `args` or `getArgs` is required.

```ts
const { time, returnValue } = measureTime(() => heavyCalc(), {
  iterations: 100,
});
```

| Option        | Type      | Description                                                                                                                                      |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `iterations?` | `number`  | How many times to run. Decimals are truncated, and values below 1 become 1. Defaults to `10`                                                     |
| `args?`       | `A`       | The arguments passed to the function                                                                                                             |
| `getArgs?`    | `() => A` | A function that creates the arguments for each run. Takes precedence over `args`. It is called for all runs before measuring, so it is not timed |

| Property      | Type     | Description                      |
| ------------- | -------- | -------------------------------- |
| `time`        | `number` | The total execution time (ms)    |
| `returnValue` | `R`      | The return value of the last run |

### `measureTimeAsync`

```ts
measureTimeAsync<R>(fn: () => Promise<R>, options?: MeasureTimeAsyncOptions<[]>): Promise<MeasureTimeAsyncResult<R>>
measureTimeAsync<A extends unknown[], R>(fn: (...args: A) => Promise<R>, options: MeasureTimeAsyncOptions<A>): Promise<MeasureTimeAsyncResult<R>>
```

The async-function version of `measureTime`. Runs `fn` one call at a time, waiting for each to finish. The options and the result are the same as `measureTime`.

### Types

| Type                            | Description                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `CompareTimeOptions<A, R>`      | Options for `compareTime`                                                                                                    |
| `CompareTimeResult<A, R>`       | The return value of `compareTime`                                                                                            |
| `CompareTimeTarget<A, R>`       | A function to measureTime `{ id, fn }`                                                                                       |
| `CompareTimeAsyncOptions<A, R>` | Same as `CompareTimeOptions<A, Promise<R>>`                                                                                  |
| `CompareTimeAsyncResult<A, R>`  | The return value of `compareTimeAsync`. Same as `CompareTimeResult<A, R>`, except that `order` functions return `Promise<R>` |
| `ElapsedTimes`                  | Times per function ID `{ [id: string]: number }`                                                                             |
| `MeasureTimeArgsOptions<A>`     | Options for the arguments passed to the function (`args` / `getArgs`)                                                        |
| `MeasureTimeOptions<A>`         | Options for `measureTime`                                                                                                    |
| `MeasureTimeResult<R>`          | The return value of `measureTime`                                                                                            |
| `MeasureTimeAsyncOptions<A>`    | Same as `MeasureTimeOptions<A>`                                                                                              |
| `MeasureTimeAsyncResult<R>`     | Same as `MeasureTimeResult<R>`                                                                                               |

## License

MIT
