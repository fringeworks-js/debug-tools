import type {
  CompareTimeOptions,
  CompareTimeResult,
  CompareTimeTarget,
} from '../compareTime';

/**
 * compareTimeAsyncのオプション
 */
export type CompareTimeAsyncOptions<
  A extends unknown[] = unknown[],
  R = unknown,
> = CompareTimeOptions<A, Promise<R>>;

/**
 * 測定結果
 */
export type CompareTimeAsyncResult<
  A extends unknown[] = unknown[],
  R = unknown,
> = Omit<CompareTimeResult<A, R>, 'order'> & {
  /**
   * 平均が短い順に並べた測定対象
   */
  order: CompareTimeTarget<A, Promise<R>>[];
};
