import type { MeasureTimeArgsOptions } from '../measureTime/types';
import _createArgsList from './_createArgsList';
import _toCount from './_toCount';

/**
 * 正規化した比較の設定
 */
export type PreparedComparison<T, A extends unknown[]> = {
  id: string;
  start: Date;
  targets: T[];
  iterations: number;
  rounds: number;
  warmUpIterations: number;
  /**
   * 指定回数分の引数を作る
   */
  createArgsList: (count: number) => A[];
};

/**
 * compareTime・compareTimeAsyncのオプションを正規化する
 * @param options オプション
 * @returns 正規化した設定
 * @throws 測定対象のIDが重複している場合
 */
export default function _prepareComparison<
  T extends { id: string },
  A extends unknown[],
>(
  options: MeasureTimeArgsOptions<A> & {
    id?: string;
    targets: T[];
    iterations?: number;
    rounds?: number;
    warmUpIterations?: number;
  },
): PreparedComparison<T, A> {
  const start = new Date();
  const { id = String(start.getTime()), targets } = options;
  // 結果はIDごとにまとめるため、重複していると区別できない
  const ids = new Set<string>();
  for (const target of targets) {
    if (ids.has(target.id)) {
      throw new Error(`Duplicate target id: ${target.id}`);
    }
    ids.add(target.id);
  }
  return {
    id,
    start,
    targets,
    iterations: _toCount(options.iterations, 10),
    rounds: _toCount(options.rounds, 10),
    warmUpIterations: _toCount(options.warmUpIterations, 0, 0),
    createArgsList: (count) => _createArgsList<A>(options, count),
  };
}
