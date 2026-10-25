/**
 * 関数に渡す引数のオプション\
 * 引数が必須の関数では、argsとgetArgsのどちらかの指定が必須
 */
export type MeasureTimeArgsOptions<A extends unknown[] = unknown[]> =
  [] extends A
    ? {
        /**
         * 関数に渡す引数
         * getArgsが指定されている場合は無効
         */
        args?: A;

        /**
         * 実行ごとに関数に渡す引数を作る\
         * 計測を始める前に実行回数分をまとめて呼び出すため、所要時間には含まない
         */
        getArgs?: () => A;
      }
    : { args: A; getArgs?: () => A } | { args?: A; getArgs: () => A };

/**
 * measureTime関数のオプション
 */
export type MeasureTimeOptions<A extends unknown[] = unknown[]> =
  MeasureTimeArgsOptions<A> & {
    /**
     * 関数の実行回数\
     * 小数は切り捨て、1未満の場合は1回にする
     * @default 10
     */
    iterations?: number;
  };

/**
 * measureTime関数の戻り値
 */
export type MeasureTimeResult<R = unknown> = {
  /**
   * 所要時間（ミリ秒）
   */
  time: number;

  /**
   * 最後に実行したときの戻り値
   */
  returnValue: R;
};
