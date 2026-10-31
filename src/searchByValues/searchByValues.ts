import type { StringCondition } from '@fringeworks/utils/string/createStringMatcher';
import { createStringMatcher } from '@fringeworks/utils/string/createStringMatcher';
import _searchTree from '../_internal/_searchTree';
import type { SearchByValuesOptions } from './types';

/**
 * 入れ子の配列・オブジェクトから、値が条件に合うものを探し、そこに通じる道筋だけを残した値を返す\
 * 文字列・数値・真偽値・bigint の値を文字列にして、`@fringeworks/utils` の `createStringMatcher` と同じルールで比べる（文字列は完全一致）。
 * null・undefined・関数などは条件に合わない。
 * 配列は要素の位置を保つ（合わなかった要素は穴になる）。素のオブジェクト以外はたどらない。
 * 残る構造は実行時に決まるため、戻り値は unknown とする
 * @param data 対象の値
 * @param condition 値の条件
 * @param options オプション
 * @returns 条件に合ったところを残した新しい値。1つも無い場合は null
 */
export default function searchByValues(
  data: unknown,
  condition: StringCondition,
  options?: SearchByValuesOptions,
): unknown {
  const isMatching = createStringMatcher(condition, options);
  return _searchTree(data, {
    isMatchingValue: (value) => {
      const text = _toText(value);
      return text !== undefined && isMatching(text);
    },
  });
}

/**
 * 表示されている文字のまま比べられる値を文字列にする。比べない値は undefined
 */
function _toText(value: unknown): string | undefined {
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
    case 'boolean':
    case 'bigint':
      return String(value);
    default:
      return undefined;
  }
}
