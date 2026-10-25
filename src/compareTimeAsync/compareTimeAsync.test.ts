import compareTimeAsync from './compareTimeAsync';

describe('compareTimeAsync', () => {
  it('複数非同期関数の実行時間を比較してresultsとreturnValuesを返す', async () => {
    const result = await compareTimeAsync({
      targets: [
        { id: 'fn1', fn: async () => 1 },
        { id: 'fn2', fn: async () => 2 },
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

  it('warmUpを有効にしてもresultsが返る', async () => {
    const result = await compareTimeAsync({
      targets: [{ id: 'fn', fn: async () => 0 }],
      rounds: 1,
      iterations: 1,
      warmUpIterations: 1,
    });
    expect(result.results).toHaveLength(1);
  });

  it('ウォームアップも1つずつ順に実行する', async () => {
    const log: string[] = [];
    const createFn = (id: string) => async () => {
      log.push(`start${id}`);
      await Promise.resolve();
      log.push(`end${id}`);
    };
    await compareTimeAsync({
      targets: [
        { id: 'a', fn: createFn('a') },
        { id: 'b', fn: createFn('b') },
      ],
      iterations: 1,
      rounds: 1,
      warmUpIterations: 1,
    });
    expect(log.slice(0, 4)).toEqual(['starta', 'enda', 'startb', 'endb']);
  });
});
