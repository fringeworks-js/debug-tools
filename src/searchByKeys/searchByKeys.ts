import type { StringCondition } from '@fringeworks/utils/string/createStringMatcher';
import { createStringMatcher } from '@fringeworks/utils/string/createStringMatcher';
import _searchTree from '../_internal/_searchTree';
import type { SearchByKeysOptions } from './types';

/**
 * 入れ子の配列・オブジェクトから、キーが条件に合うプロパティを探し、そこに通じる道筋だけを残した値を返す\
 * 条件に合ったキーの値はそのまま残す。条件は `@fringeworks/utils` の `createStringMatcher` と同じルールで比べる（文字列は完全一致）。
 * 配列は要素の位置を保つ（合わなかった要素は穴になる）。素のオブジェクト以外はたどらない。
 * 残る構造は実行時に決まるため、戻り値は unknown とする
 * @param data 対象の値
 * @param condition キーの条件
 * @param options オプション
 * @returns 条件に合ったところを残した新しい値。1つも無い場合は null
 */
export default function searchByKeys(
  data: unknown,
  condition: StringCondition,
  options?: SearchByKeysOptions,
): unknown {
  return _searchTree(data, {
    isMatchingKey: createStringMatcher(condition, options),
  });
}
