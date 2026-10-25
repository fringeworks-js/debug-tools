import type { MeasureTimeResult } from '../measureTime/types';

/**
 * 引数ごとに関数を実行し、全体にかかった時間を測定する\
 * performance.now()の精度は環境によって粗くされているため、1回ごとではなくまとめて測定する
 * @param fn 測定対象の関数
 * @param argsList 実行ごとの引数。1件以上であること
 * @returns 所要時間と最後の戻り値
 */
export default function _run<A extends unknown[], R>(
  fn: (...args: A) => R,
  argsList: A[],
): MeasureTimeResult<R> {
  let returnValue: R | undefined;
  const start = performance.now();
  for (let i = 0; i < argsList.length; i++) {
    returnValue = fn(...argsList[i]!);
  }
  const time = performance.now() - start;
  return { time, returnValue: returnValue as R };
}
