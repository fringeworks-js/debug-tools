import type { MeasureTimeArgsOptions } from '../measureTime';

/**
 * 測定する対象
 */
export type CompareTimeTarget<A extends unknown[] = unknown[], R = unknown> = {
  /**
   * ID\
   * 測定対象ごとに異なる値にする
   */
  id: string;

  /**
   * 測定対象の関数
   * @param args
   * @returns
   */
  fn: (...args: A) => R;
};

/**
 * compareTimeのオプション
 */
export type CompareTimeOptions<
  A extends unknown[] = unknown[],
  R = unknown,
> = MeasureTimeArgsOptions<A> & {
  /**
   * ID
   */
  id?: string;

  /**
   * 測定対象
   */
  targets: CompareTimeTarget<A, R>[];

  /**
   * 1周の中で各測定対象を実行する回数\
   * 小数は切り捨て、1未満の場合は1回にする
   * @default 10
   */
  iterations?: number;

  /**
   * 測定を何周行うか\
   * 1周ごとに各測定対象の関数を`iterations`回ずつ実行し、周ごとに測定する順番を入れ替える。
   * 同じ周の中では、すべての測定対象に同じ引数を渡す。
   * 小数は切り捨て、1未満の場合は1周にする
   * @default 10
   */
  rounds?: number;

  /**
   * 測定前に各測定対象を実行する回数\
   * 小数は切り捨て、0未満の場合は0回にする
   * @default 0
   */
  warmUpIterations?: number;
};

/**
 * 計測された処理時間
 */
export type ElapsedTimes = {
  /**
   * 測定対象毎の処理時間
   */
  [targetId: string]: number;
};

/**
 * 測定結果
 */
export type CompareTimeResult<A extends unknown[] = unknown[], R = unknown> = {
  /**
   * 測定対象毎の1周あたりの平均（ミリ秒）
   */
  average: ElapsedTimes;

  /**
   * 全体の平均（ミリ秒）\
   * 測定対象が無い場合は0
   */
  totalAverage: number;

  /**
   * 平均が短い順に並べた測定対象
   */
  order: CompareTimeTarget<A, R>[];

  /**
   * ID
   */
  id: string;

  /**
   * 周ごとの測定結果
   */
  results: ElapsedTimes[];

  /**
   * 測定対象毎の最後の戻り値
   */
  returnValues: { [targetId: string]: R };

  /**
   * 測定開始日時
   */
  start: Date;

  /**
   * 測定終了日時
   */
  end: Date;
};
