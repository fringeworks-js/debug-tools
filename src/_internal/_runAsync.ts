import type { MeasureTimeResult } from '../measureTime/types';

/**
 * 引数ごとに非同期関数を1つずつ順に実行し、全体にかかった時間を測定する
 * @param fn 測定対象の関数
 * @param argsList 実行ごとの引数。1件以上であること
 * @returns 所要時間と最後の戻り値
 */
export default async function _runAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  argsList: A[],
): Promise<MeasureTimeResult<R>> {
  let returnValue: R | undefined;
  const start = performance.now();
  for (let i = 0; i < argsList.length; i++) {
    returnValue = await fn(...argsList[i]!);
  }
  const time = performance.now() - start;
  return { time, returnValue: returnValue as R };
}
