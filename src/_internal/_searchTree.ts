/**
 * 入れ子の配列・素のオブジェクトをたどり、条件に合ったところに通じる道筋だけを残した部分の木を作る\
 * searchByKeys・searchByValues の共通の処理
 *
 * - 配列は要素の位置を保つ（合わなかった要素は穴になる）
 * - 素のオブジェクト以外（Map・クラスのインスタンスなど）はたどらない
 * - たどっている道筋の上にある（祖先の）オブジェクトは、もうたどらない（循環参照で処理が終わらなくなるのを防ぐ）
 * @param data 対象の値
 * @param matchers 判定の関数
 * @returns 条件に合ったところを残した値。1つも無い場合は null
 */
export default function _searchTree(
  data: unknown,
  matchers: _SearchMatchers,
): unknown {
  return _search(data, matchers, new Set()) ?? null;
}

export type _SearchMatchers = {
  /**
   * オブジェクトのキーが条件に合うか。合った場合は値をそのまま残す
   */
  isMatchingKey?: (key: string) => boolean;

  /**
   * 配列・素のオブジェクト以外の値が条件に合うか
   */
  isMatchingValue?: (value: unknown) => boolean;
};

function _search(
  data: unknown,
  matchers: _SearchMatchers,
  ancestors: Set<object>,
): unknown {
  if (Array.isArray(data)) {
    if (ancestors.has(data)) {
      return undefined;
    }
    ancestors.add(data);
    const array: unknown[] = [];
    data.forEach((item: unknown, index) => {
      const result = _search(item, matchers, ancestors);
      if (result !== undefined) {
        // 元の位置を保つ
        array[index] = result;
      }
    });
    ancestors.delete(data);
    return array.length ? array : undefined;
  }

  if (_isPlainObject(data)) {
    if (ancestors.has(data)) {
      return undefined;
    }
    ancestors.add(data);
    const record = data as Record<string, unknown>;
    const obj: Record<string, unknown> = {};
    let found = false;
    for (const key of Object.keys(record)) {
      // プロトタイプを書き換えないよう、__proto__ は扱わない
      if (key === '__proto__') {
        continue;
      }
      const value = record[key];
      if (matchers.isMatchingKey?.(key)) {
        // 条件に合うキーは値ごと残す
        obj[key] = value;
        found = true;
      } else {
        const result = _search(value, matchers, ancestors);
        if (result !== undefined) {
          obj[key] = result;
          found = true;
        }
      }
    }
    ancestors.delete(data);
    return found ? obj : undefined;
  }

  return matchers.isMatchingValue?.(data) ? data : undefined;
}

/**
 * 素のオブジェクト（オブジェクトリテラル・JSON から作ったもの・プロトタイプが null のもの）か
 */
function _isPlainObject(value: unknown): value is object {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
