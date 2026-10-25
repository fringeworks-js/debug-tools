import type { ElapsedTimes } from '../compareTime/types';
import type { PreparedComparison } from './_prepareComparison';

/**
 * 測定結果を集計する
 * @param prepared 測定の設定
 * @param results 周ごとの測定結果
 * @param returnValues 測定対象毎の最後の戻り値
 * @returns 測定結果
 */
export default function _tabulateResult<T extends { id: string }, R>(
  prepared: Pick<PreparedComparison<T, unknown[]>, 'id' | 'start' | 'targets'>,
  results: ElapsedTimes[],
  returnValues: Record<string, R>,
) {
  const { id, start, targets } = prepared;
  const rounds = results.length;
  // 測定対象毎の平均
  const average: ElapsedTimes = {};
  let total = 0;
  for (const { id: targetId } of targets) {
    let sum = 0;
    for (const result of results) {
      sum += result[targetId] ?? 0;
    }
    average[targetId] = sum / rounds;
    total += sum;
  }

  return {
    id,
    results,
    returnValues,
    start,
    end: new Date(),
    average,
    // 全体の平均(全測定結果の合計 / (測定対象数 * 測定回数))
    totalAverage: targets.length > 0 ? total / (targets.length * rounds) : 0,
    // 平均が短い順
    order: [...targets].sort((a, b) => average[a.id]! - average[b.id]!),
  };
}
