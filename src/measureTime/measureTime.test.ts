import measureTime from './measureTime';

describe('measureTime', () => {
  it('デフォルトで10回実行しtimeとreturnValueを返す', () => {
    const fn = vi.fn(() => 42);
    const result = measureTime(fn);
    expect(fn).toHaveBeenCalledTimes(10);
    expect(result.returnValue).toBe(42);
    expect(result.time).toBeGreaterThanOrEqual(0);
  });

  it('iterationsで実行回数を指定できる', () => {
    const fn = vi.fn(() => 'hello');
    const result = measureTime(fn, { iterations: 5 });
    expect(fn).toHaveBeenCalledTimes(5);
    expect(result.returnValue).toBe('hello');
  });

  it('argsで引数を渡せる', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const result = measureTime(fn, { args: [3, 4] });
    expect(result.returnValue).toBe(7);
  });

  it('getArgsで毎回異なる引数を渡せる', () => {
    let count = 0;
    const fn = vi.fn((n: number) => n);
    measureTime(fn, { iterations: 3, getArgs: () => [count++] as [number] });
    expect(fn).toHaveBeenNthCalledWith(1, 0);
    expect(fn).toHaveBeenNthCalledWith(2, 1);
    expect(fn).toHaveBeenNthCalledWith(3, 2);
  });

  it('getArgsは計測の前に実行回数分呼ばれる', () => {
    const calls: string[] = [];
    const fn = (n: number) => calls.push(`fn${n}`);
    let count = 0;
    measureTime(fn, {
      iterations: 2,
      getArgs: () => {
        calls.push(`getArgs${count}`);
        return [count++] as [number];
      },
    });
    expect(calls).toEqual(['getArgs0', 'getArgs1', 'fn0', 'fn1']);
  });

  it('iterationsが1未満の場合は1回、無効な値の場合は10回実行する', () => {
    const fn = vi.fn(() => 0);
    measureTime(fn, { iterations: 0 });
    expect(fn).toHaveBeenCalledTimes(1);
    fn.mockClear();
    measureTime(fn, { iterations: 2.9 });
    expect(fn).toHaveBeenCalledTimes(2);
    fn.mockClear();
    measureTime(fn, { iterations: NaN });
    expect(fn).toHaveBeenCalledTimes(10);
  });

  it('型: 引数が必須の関数ではargsかgetArgsが必須', () => {
    const fn = (a: number) => a;
    // @ts-expect-error argsもgetArgsも無い
    measureTime(fn, {});
    measureTime(fn, { args: [1] });
    measureTime(fn, { getArgs: () => [1] });
    expectTypeOf(measureTime(() => 1).returnValue).toEqualTypeOf<number>();
  });
});
