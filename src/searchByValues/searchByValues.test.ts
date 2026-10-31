import searchByValues from './searchByValues';

describe('searchByValues', () => {
  const data = {
    user: { name: 'Alice', age: 20, active: true },
    items: [
      { id: 1, label: 'apple' },
      { id: 12, label: 'Apple pie' },
    ],
    note: null,
  };

  it('値が条件に合うところに通じる道筋だけを残す', () => {
    expect(searchByValues(data, 'Alice')).toEqual({
      user: { name: 'Alice' },
    });
  });

  it('文字列は完全一致', () => {
    expect(searchByValues(data, 'Ali')).toBeNull();
  });

  it('StringComparisonで部分一致などを指定できる', () => {
    expect(searchByValues(data, { includes: 'pple' })).toEqual({
      items: [{ label: 'apple' }, { label: 'Apple pie' }],
    });
  });

  it('数値・真偽値・bigintは文字列にして比べる', () => {
    expect(searchByValues(data, '20')).toEqual({ user: { age: 20 } });
    expect(searchByValues(data, 'true')).toEqual({ user: { active: true } });
    expect(searchByValues(data, { startsWith: '1' })).toEqual({
      items: [{ id: 1 }, { id: 12 }],
    });
    expect(searchByValues({ big: 10n }, '10')).toEqual({ big: 10n });
  });

  it('null・undefined・関数は条件に合わない', () => {
    const fn = () => {};
    const target = { a: null, b: undefined, c: fn };
    expect(searchByValues(target, 'null')).toBeNull();
    expect(searchByValues(target, 'undefined')).toBeNull();
    expect(searchByValues(target, { includes: '' })).toBeNull();
  });

  it('配列は要素の位置を保つ（合わなかった要素は穴になる）', () => {
    const result = searchByValues(['a', 'b', 'c'], 'c') as unknown[];
    expect(result).toHaveLength(3);
    expect(0 in result).toBe(false);
    expect(1 in result).toBe(false);
    expect(result[2]).toBe('c');
  });

  it('値そのものが条件に合えば、その値を返す', () => {
    expect(searchByValues('abc', 'abc')).toBe('abc');
    expect(searchByValues(1, '1')).toBe(1);
  });

  it('1つも無い場合はnull', () => {
    expect(searchByValues(data, 'none')).toBeNull();
    expect(searchByValues({}, { includes: '' })).toBeNull();
  });

  it('ignoreCaseを使える', () => {
    expect(searchByValues(data, 'apple', { ignoreCase: true })).toEqual({
      items: [{ label: 'apple' }],
    });
  });

  it('素のオブジェクト以外はたどらない', () => {
    const date = new Date(0);
    expect(searchByValues({ set: new Set(['a']), date }, 'a')).toBeNull();
  });

  it('循環参照があっても終わる', () => {
    const node: Record<string, unknown> = { label: 'root' };
    node.self = node;
    expect(searchByValues(node, 'root')).toEqual({ label: 'root' });
  });
});
