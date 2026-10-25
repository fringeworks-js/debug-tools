import { rotateArray } from '@fringeworks/utils/array/rotateArray';
import _prepareComparison from '../_internal/_prepareComparison';
import _runAsync from '../_internal/_runAsync';
import _tabulateResult from '../_internal/_tabulateResult';
import type { CompareTimeTarget, ElapsedTimes } from '../compareTime';
import type { CompareTimeAsyncOptions, CompareTimeAsyncResult } from './types';

/**
 * 複数の非同期関数の実行時間を測定し比較する\
 * 実行は1つずつ順に行う。
 * 周ごとに測定する順番を入れ替え、同じ周の中ではすべての測定対象に同じ引数を渡す
 * @param options オプション
 * @returns 測定結果
 * @throws 測定対象のIDが重複している場合
 */
export default async function compareTimeAsync<
  A extends unknown[] = unknown[],
  R = unknown,
>(
  options: CompareTimeAsyncOptions<A, R>,
): Promise<CompareTimeAsyncResult<A, R>> {
  const prepared = _prepareComparison<CompareTimeTarget<A, Promise<R>>, A>(
    options,
  );
  const { targets, iterations, rounds, warmUpIterations, createArgsList } =
    prepared;
  // 各周の測定結果
  const results: ElapsedTimes[] = [];
  // 各測定対象の最後の戻り値
  const returnValues: Record<string, R> = {};

  if (warmUpIterations > 0) {
    const argsList = createArgsList(warmUpIterations);
    for (const target of targets) {
      await _runAsync(target.fn, argsList);
    }
  }

  // 測定する順番を変えながら測定を行う
  let processingOrder = targets;
  for (let i = 0; i < rounds; i++) {
    // このループ1回分が測定結果を一覧にした際の1行分
    const argsList = createArgsList(iterations);
    const result: ElapsedTimes = {};
    for (const target of processingOrder) {
      const { time, returnValue } = await _runAsync(target.fn, argsList);
      result[target.id] = time;
      returnValues[target.id] = returnValue;
    }
    results.push(result);
    processingOrder = rotateArray(processingOrder);
  }

  return _tabulateResult(prepared, results, returnValues);
}
