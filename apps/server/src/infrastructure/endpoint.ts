import { Request, RequestHandler } from 'express';

export function endpoint<Result>(fn: () => Result | Promise<Result>): RequestHandler;

export function endpoint<Param, Result>(
  fn: (param: Param) => Result | Promise<Result>,
  getParam: (req: Request) => Param,
): RequestHandler;

export function endpoint<Param, Result>(
  fn: (param?: Param) => Result | Promise<Result>,
  getParam?: (req: Request) => Param,
): RequestHandler {
  return async (req, res) => {
    res.json(await fn(getParam?.(req)));
  };
}
