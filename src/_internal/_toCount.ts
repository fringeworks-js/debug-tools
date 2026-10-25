/**
 * 回数として扱える整数にする\
 * 小数は切り捨て、min未満はminにする。数値でない場合や無限大の場合はdefaultValueを返す
 * @param value 回数
 * @param defaultValue 未指定・無効な場合の値
 * @param min 最小値
 * @returns 回数
 */
export default function _toCount(
  value: number | undefined,
  defaultValue: number,
  min = 1,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return defaultValue;
  }
  return Math.max(min, Math.floor(value));
}
