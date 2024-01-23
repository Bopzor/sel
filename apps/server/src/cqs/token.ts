export type Token<Params extends unknown[], Result> = {
  __symbol: symbol;
  __params?: Params;
  __result?: Result;
};

export function token<Fn extends (...params: unknown[]) => unknown>(
  description?: string
): Token<Parameters<Fn>, ReturnType<Fn>> {
  return { __symbol: Symbol(description) };
}
