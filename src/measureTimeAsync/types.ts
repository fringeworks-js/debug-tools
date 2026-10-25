import type { MeasureTimeOptions, MeasureTimeResult } from '../measureTime';

/**
 * measureTimeAsync関数のオプション
 */
export type MeasureTimeAsyncOptions<A extends unknown[] = unknown[]> =
  MeasureTimeOptions<A>;

/**
 * measureTimeAsync関数の戻り値
 */
export type MeasureTimeAsyncResult<R = unknown> = MeasureTimeResult<R>;
