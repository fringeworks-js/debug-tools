import compareTime from './compareTime';

describe('compareTime', () => {
  it('複数関数の実行時間を比較してresultsとreturnValuesを返す', () => {
    const result = compareTime({
      targets: [
        { id: 'fn1', fn: () => 1 },
        { id: 'fn2', fn: () => 2 },
      ],
      rounds: 2,
      iterations: 2,
    });
    expect(result.results).toHaveLength(2);
    expect(result.returnValues['fn1']).toBe(1);
    expect(result.returnValues['fn2']).toBe(2);
    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
  });

  it('idを省略するとstart時刻のgetTimeが使われる', () => {
    const result = compareTime({
      targets: [{ id: 'fn', fn: () => 0 }],
      rounds: 1,
    });
    expect(typeof result.id).toBe('string');
  });

  it('warmUpを有効にしてもresultsが返る', () => {
    const result = compareTime({
      targets: [{ id: 'fn', fn: () => 0 }],
      rounds: 1,
      iterations: 1,
      warmUpIterations: 1,
    });
    expect(result.results).toHaveLength(1);
  });

  it('同じ周の中ではすべての測定対象に同じ引数を渡す', () => {
    const received: Record<string, number[]> = { a: [], b: [] };
    let count = 0;
    compareTime({
      targets: [
        { id: 'a', fn: (n: number) => received['a']!.push(n) },
        { id: 'b', fn: (n: number) => received['b']!.push(n) },
      ],
      getArgs: () => [count++] as [number],
      iterations: 2,
      rounds: 2,
    });
    expect(received['a']).toEqual([0, 1, 2, 3]);
    expect(received['b']).toEqual([0, 1, 2, 3]);
  });

  it('warmUpIterationsの回数だけ測定前に実行する', () => {
    const fn = vi.fn(() => 0);
    compareTime({
      targets: [{ id: 'fn', fn }],
      iterations: 1,
      rounds: 1,
      warmUpIterations: 3,
    });
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('IDが重複している場合はエラー', () => {
    expect(() =>
      compareTime({
        targets: [
          { id: 'a', fn: () => 1 },
          { id: 'a', fn: () => 2 },
        ],
      }),
    ).toThrow('Duplicate target id: a');
  });

  it('roundsが1未満の場合は1周にする', () => {
    const result = compareTime({
      targets: [{ id: 'fn', fn: () => 0 }],
      rounds: 0,
    });
    expect(result.results).toHaveLength(1);
    expect(Number.isNaN(result.average['fn'])).toBe(false);
  });

  it('測定対象が無い場合', () => {
    const result = compareTime({ targets: [], rounds: 1 });
    expect(result.totalAverage).toBe(0);
    expect(result.order).toEqual([]);
  });

  it('orderは平均が短い順', () => {
    const result = compareTime({
      targets: [
        { id: '2', fn: () => 0 },
        { id: '1', fn: () => 0 },
      ],
      rounds: 2,
    });
    const averages = result.order.map((target) => result.average[target.id]!);
    expect(averages).toEqual([...averages].sort((a, b) => a - b));
    expect(result.order.map((target) => target.id).sort()).toEqual(['1', '2']);
  });
});
