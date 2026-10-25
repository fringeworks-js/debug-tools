# @fringeworks/debug-tools

`@fringeworks/debug-tools` は、開発中にプログラムの動き（かかった時間など）を測る・見るための道具を集めた、誰かにとっては便利なライブラリです。

**[English README is available here](./README.md)**

## インストール

```bash
npm install @fringeworks/debug-tools
# または
pnpm add @fringeworks/debug-tools
```

## 使い方

関数・型は、ルートと関数単位のパスのどちらからでも同じ名前で import できます。関数単位のパスでは、その関数を default import することもできます。

```ts
import { measureTime } from '@fringeworks/debug-tools';
import measureTime from '@fringeworks/debug-tools/measureTime';
```

---

## API

| 関数                             | 説明                                                 |
| -------------------------------- | ---------------------------------------------------- |
| `compareTime(options)`           | 複数の関数の実行時間を測定して比較する               |
| `compareTimeAsync(options)`      | 複数の非同期関数の実行時間を測定して比較する         |
| `measureTime(fn, options?)`      | 関数を指定の回数実行し、かかった時間を測定する       |
| `measureTimeAsync(fn, options?)` | 非同期関数を指定の回数実行し、かかった時間を測定する |

### `compareTime`

```ts
compareTime<A extends unknown[] = unknown[], R = unknown>(options: CompareTimeOptions<A, R>): CompareTimeResult<A, R>
```

`targets` の関数の実行時間を測定して比較します。1周ごとに各関数を `iterations` 回ずつ実行して時間を測り、これを `rounds` 周繰り返します。周ごとに実行する順番を入れ替え、順番による偏りを減らします。同じ周の中では、すべての関数に同じ引数を渡します。

`targets` の `id` が重複している場合はエラーになります。

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
result.order.map((target) => target.id); // 速い順
```

| オプション          | 型                          | 説明                                                                                      |
| ------------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| `targets`           | `CompareTimeTarget<A, R>[]` | 測定する関数 `{ id, fn }` の配列。`id` は関数ごとに異なる値にする                         |
| `iterations?`       | `number`                    | 1周の中で各関数を実行する回数。小数は切り捨て、1 未満の場合は 1 にする。デフォルトは `10` |
| `rounds?`           | `number`                    | 測定を繰り返す周数。小数は切り捨て、1 未満の場合は 1 にする。デフォルトは `10`            |
| `args?`             | `A`                         | 関数に渡す引数                                                                            |
| `getArgs?`          | `() => A`                   | 実行するたびに引数を作る関数。指定した場合は `args` より優先する。`measureTime` と同じ    |
| `warmUpIterations?` | `number`                    | 測定前に各関数を実行する回数。小数は切り捨て、0 未満の場合は 0 にする。デフォルトは `0`   |
| `id?`               | `string`                    | 測定の ID。結果にそのまま含める。デフォルトは開始時刻のミリ秒                             |

| プロパティ     | 型                          | 説明                                                   |
| -------------- | --------------------------- | ------------------------------------------------------ |
| `average`      | `ElapsedTimes`              | 関数ごとの1周あたりの平均時間（ミリ秒）                |
| `totalAverage` | `number`                    | 全関数の平均時間（ミリ秒）。`targets` が空の場合は `0` |
| `order`        | `CompareTimeTarget<A, R>[]` | 平均時間が短い順に並べた測定対象                       |
| `results`      | `ElapsedTimes[]`            | 周ごとの関数ごとの時間                                 |
| `returnValues` | `{ [id: string]: R }`       | 関数ごとの最後の戻り値                                 |
| `start`        | `Date`                      | 測定の開始日時                                         |
| `end`          | `Date`                      | 測定の終了日時                                         |
| `id`           | `string`                    | 測定の ID                                              |

### `compareTimeAsync`

```ts
compareTimeAsync<A extends unknown[] = unknown[], R = unknown>(options: CompareTimeAsyncOptions<A, R>): Promise<CompareTimeAsyncResult<A, R>>
```

`compareTime` の非同期関数版です。ウォームアップも含め、各関数の実行は1つずつ順番に行います。オプションと戻り値は `compareTime` と同じです。

### `measureTime`

```ts
measureTime<R>(fn: () => R, options?: MeasureTimeOptions<[]>): MeasureTimeResult<R>
measureTime<A extends unknown[], R>(fn: (...args: A) => R, options: MeasureTimeOptions<A>): MeasureTimeResult<R>
```

`fn` を `iterations` 回実行し、合計の実行時間（ミリ秒）と最後の戻り値を返します。時間は `performance.now()` で測定します。`performance.now()` の精度は環境によって粗くされているため、1回ごとではなく全体をまとめて測定します。

`fn` に必須の引数がある場合は、`args` か `getArgs` のどちらかが必須です。

```ts
const { time, returnValue } = measureTime(() => heavyCalc(), {
  iterations: 100,
});
```

| オプション    | 型        | 説明                                                                                                                   |
| ------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `iterations?` | `number`  | 実行する回数。小数は切り捨て、1 未満の場合は 1 にする。デフォルトは `10`                                               |
| `args?`       | `A`       | 関数に渡す引数                                                                                                         |
| `getArgs?`    | `() => A` | 実行するたびに引数を作る関数。指定した場合は `args` より優先する。測定を始める前にまとめて呼ぶため、時間には含まれない |

| プロパティ    | 型       | 説明                       |
| ------------- | -------- | -------------------------- |
| `time`        | `number` | 合計の実行時間（ミリ秒）   |
| `returnValue` | `R`      | 最後に実行したときの戻り値 |

### `measureTimeAsync`

```ts
measureTimeAsync<R>(fn: () => Promise<R>, options?: MeasureTimeAsyncOptions<[]>): Promise<MeasureTimeAsyncResult<R>>
measureTimeAsync<A extends unknown[], R>(fn: (...args: A) => Promise<R>, options: MeasureTimeAsyncOptions<A>): Promise<MeasureTimeAsyncResult<R>>
```

`measureTime` の非同期関数版です。`fn` を1回ずつ順番に実行し、完了を待ってから次を実行します。オプションと戻り値は `measureTime` と同じです。

### 型

| 型                              | 説明                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `CompareTimeOptions<A, R>`      | `compareTime` のオプション                                                                               |
| `CompareTimeResult<A, R>`       | `compareTime` の戻り値                                                                                   |
| `CompareTimeTarget<A, R>`       | 測定する関数 `{ id, fn }`                                                                                |
| `CompareTimeAsyncOptions<A, R>` | `CompareTimeOptions<A, Promise<R>>` と同じ                                                               |
| `CompareTimeAsyncResult<A, R>`  | `compareTimeAsync` の戻り値。`order` の関数が `Promise<R>` を返す以外は `CompareTimeResult<A, R>` と同じ |
| `ElapsedTimes`                  | 関数の ID ごとの時間 `{ [id: string]: number }`                                                          |
| `MeasureTimeArgsOptions<A>`     | 関数に渡す引数のオプション（`args` / `getArgs`）                                                         |
| `MeasureTimeOptions<A>`         | `measureTime` のオプション                                                                               |
| `MeasureTimeResult<R>`          | `measureTime` の戻り値                                                                                   |
| `MeasureTimeAsyncOptions<A>`    | `MeasureTimeOptions<A>` と同じ                                                                           |
| `MeasureTimeAsyncResult<R>`     | `MeasureTimeResult<R>` と同じ                                                                            |

## ライセンス

MIT
