type Next = () => Promise<void>;
type Hook = (next: Next) => Promise<void>;

export class Bus {
  private hooks = new Array<Hook>();

  registerHook(hook: Hook) {
    this.hooks.push(hook);
  }

  async execute<Params extends unknown[], Result>(
    fn: (...params: Params) => Promise<Result>,
    ...params: Params
  ): Promise<Result> {
    let result: Result;

    const chain = this.hooks.reduceRight(
      (next: Next, fn) => {
        return () => fn(next);
      },
      async () => {
        result = await fn(...params);
      }
    );

    await chain();

    // @ts-expect-error result is set
    return result;
  }
}
