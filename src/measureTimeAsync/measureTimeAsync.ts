import _createArgsList from '../_internal/_createArgsList';
import _runAsync from '../_internal/_runAsync';
import _toCount from '../_internal/_toCount';
import type { MeasureTimeAsyncOptions, MeasureTimeAsyncResult } from './types';

/**
 * 非同期関数を指定回数、1つずつ順に実行し、全体にかかった時間を測定する\
 * 実行回数を指定しなかった場合は10回実行する
 * @param fn 測定対象の関数
 * @param options オプション。引数が必須の関数では、argsかgetArgsの指定が必須
 * @returns 所要時間と最後の戻り値
 */
export default function measureTimeAsync<R>(
  fn: () => Promise<R>,
  options?: MeasureTimeAsyncOptions<[]>,
): Promise<MeasureTimeAsyncResult<R>>;
export default function measureTimeAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  options: MeasureTimeAsyncOptions<A>,
): Promise<MeasureTimeAsyncResult<R>>;
export default function measureTimeAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  options: MeasureTimeAsyncOptions<A> = {} as MeasureTimeAsyncOptions<A>,
): Promise<MeasureTimeAsyncResult<R>> {
  const iterations = _toCount(options.iterations, 10);
  return _runAsync(fn, _createArgsList(options, iterations));
}
