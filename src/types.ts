// 文字列の条件の型（`searchByKeys`・`searchByValues` の `condition`）と、その中の型。
// 利用者が `@fringeworks/utils` を入れずに使えるよう、ここから export する
export type {
  StringComparison,
  StringCondition,
  StringConditionItem,
  StringPredicate,
} from '@fringeworks/utils/string/createStringMatcher';
