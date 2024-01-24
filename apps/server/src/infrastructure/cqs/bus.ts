type Hook = (next: () => void) => void;

export class Bus {
  private _before = new Array<Hook>();
  before(hook: Hook) {
    this._before.push(hook);
  }

  private _after = new Array<Hook>();
  after(hook: Hook) {
    this._after.push(hook);
  }

  async execute<Params extends unknown[], Result>(
    fn: (...params: Params) => Promise<Result>,
    ...params: Params
  ): Promise<Result> {
    let result: Result;

    const setResult = (value: Result) => {
      result = value;
    };

    const hooks: Hook[] = [
      ...this._before,
      (next) =>
        fn(...params)
          .then(setResult)
          .then(next),
      ...this._after,
    ];

    await new Promise<void>((resolve) => {
      const chain = hooks.reduceRight((next, fn) => {
        return () => fn(next);
      }, resolve);
      chain();
    });

    // @ts-expect-error setResult was called
    return result;
  }
}
