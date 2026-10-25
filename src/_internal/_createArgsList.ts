/**
 * 実行ごとの引数を、計測を始める前にまとめて作る\
 * getArgsの呼び出しを計測する時間に含めないため
 * @param options 引数のオプション
 * @param count 実行回数
 * @returns 実行ごとの引数
 */
export default function _createArgsList<A extends unknown[]>(
  options: { args?: A; getArgs?: () => A },
  count: number,
): A[] {
  const { args = [] as unknown as A, getArgs } = options;
  return Array.from({ length: count }, getArgs ? () => getArgs() : () => args);
}
