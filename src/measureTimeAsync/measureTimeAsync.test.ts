import measureTimeAsync from './measureTimeAsync';

describe('measureTimeAsync', () => {
  it('デフォルトで10回実行しtimeとreturnValueを返す', async () => {
    const fn = vi.fn(async () => 42);
    const result = await measureTimeAsync(fn);
    expect(fn).toHaveBeenCalledTimes(10);
    expect(result.returnValue).toBe(42);
    expect(result.time).toBeGreaterThanOrEqual(0);
  });

  it('iterationsで実行回数を指定できる', async () => {
    const fn = vi.fn(async () => 'hello');
    const result = await measureTimeAsync(fn, { iterations: 3 });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(result.returnValue).toBe('hello');
  });

  it('argsで引数を渡せる', async () => {
    const fn = vi.fn(async (a: number, b: number) => a + b);
    const result = await measureTimeAsync(fn, { args: [2, 3] });
    expect(result.returnValue).toBe(5);
  });

  it('getArgsで各イテレーションに異なる引数を渡せる', async () => {
    let call = 0;
    const fn = vi.fn(async (n: number) => n);
    const result = await measureTimeAsync(fn, {
      iterations: 2,
      getArgs: () => [call++] as [number],
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.returnValue).toBe(1);
  });

  it('fnが拒否した場合はrejectされる', async () => {
    const fn = vi.fn(async () => {
      throw new Error('test error');
    });
    await expect(measureTimeAsync(fn, { iterations: 1 })).rejects.toThrow(
      'test error',
    );
  });

  it('1つずつ順に実行する', async () => {
    const log: string[] = [];
    const fn = async (n: number) => {
      log.push(`start${n}`);
      await Promise.resolve();
      log.push(`end${n}`);
    };
    let count = 0;
    await measureTimeAsync(fn, { iterations: 2, getArgs: () => [count++] });
    expect(log).toEqual(['start0', 'end0', 'start1', 'end1']);
  });
});
