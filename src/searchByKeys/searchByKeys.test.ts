import searchByKeys from './searchByKeys';

describe('searchByKeys', () => {
  const data = {
    user: { name: 'Alice', profile: { nickname: 'A', age: 20 } },
    items: [{ id: 1, name: 'apple' }, { id: 2 }],
    count: 3,
  };

  it('キーが条件に合うプロパティに通じる道筋だけを残す', () => {
    expect(searchByKeys(data, 'name')).toEqual({
      user: { name: 'Alice' },
      items: [{ name: 'apple' }],
    });
  });

  it('文字列は完全一致', () => {
    expect(searchByKeys(data, 'nick')).toBeNull();
    expect(searchByKeys(data, 'nickname')).toEqual({
      user: { profile: { nickname: 'A' } },
    });
  });

  it('StringComparisonで部分一致などを指定できる', () => {
    expect(searchByKeys(data, { includes: 'name' })).toEqual({
      user: { name: 'Alice', profile: { nickname: 'A' } },
      items: [{ name: 'apple' }],
    });
  });

  it('配列の条件はどれかに合えば残す', () => {
    expect(searchByKeys(data, ['age', /^cou/])).toEqual({
      user: { profile: { age: 20 } },
      count: 3,
    });
  });

  it('条件に合ったキーの値はそのまま残す', () => {
    const result = searchByKeys(data, 'profile') as typeof data;
    expect(result).toEqual({ user: { profile: { nickname: 'A', age: 20 } } });
    expect(result.user.profile).toBe(data.user.profile);
  });

  it('配列は要素の位置を保つ（合わなかった要素は穴になる）', () => {
    const result = searchByKeys([{ a: 1 }, { b: 2 }], 'b') as unknown[];
    expect(result).toHaveLength(2);
    expect(0 in result).toBe(false);
    expect(result[1]).toEqual({ b: 2 });
  });

  it('配列の添字はキーとして比べない', () => {
    expect(searchByKeys(['x', 'y'], '0')).toBeNull();
  });

  it('1つも無い場合はnull', () => {
    expect(searchByKeys(data, 'none')).toBeNull();
    expect(searchByKeys('text', 'text')).toBeNull();
    expect(searchByKeys(null, 'a')).toBeNull();
  });

  it('ignoreCase・normalizeを使える', () => {
    expect(searchByKeys({ Name: 1 }, 'name', { ignoreCase: true })).toEqual({
      Name: 1,
    });
    expect(
      searchByKeys({ ｎａｍｅ: 1 }, 'name', {
        normalize: (value) => value.normalize('NFKC'),
      }),
    ).toEqual({ ｎａｍｅ: 1 });
  });

  it('素のオブジェクト以外はたどらない', () => {
    const map = new Map([['name', 1]]);
    class Item {
      name = 'x';
    }
    expect(searchByKeys({ map, item: new Item() }, 'name')).toBeNull();
  });

  it('循環参照があっても終わる', () => {
    const node: Record<string, unknown> = { name: 'root' };
    node.self = node;
    node.children = [{ parent: node, name: 'child' }];
    expect(searchByKeys(node, 'name')).toEqual({
      name: 'root',
      children: [{ name: 'child' }],
    });
  });

  it('循環していない共有の参照は、どちらの位置でも探す', () => {
    const shared = { name: 'shared' };
    expect(searchByKeys({ a: shared, b: shared }, 'name')).toEqual({
      a: { name: 'shared' },
      b: { name: 'shared' },
    });
  });

  it('__proto__ は扱わない', () => {
    const json = JSON.parse('{"__proto__": {"name": 1}, "name": 2}') as object;
    const result = searchByKeys(json, 'name') as object;
    expect(result).toEqual({ name: 2 });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it('元の値を書き換えない', () => {
    const source = { a: { b: 1, c: 2 } };
    searchByKeys(source, 'b');
    expect(source).toEqual({ a: { b: 1, c: 2 } });
  });
});
