import { useSearchParams } from '@solidjs/router';
import { Accessor, createMemo } from 'solid-js';
import z from 'zod';

type UseSearchParamResult<Value> = [param: Accessor<Value>, setParam: (param: Value) => void];

export function useSearchParam(name: string): UseSearchParamResult<string | undefined>;

export function useSearchParam<Value>(
  name: string,
  parse: (value: string | undefined) => Value,
): UseSearchParamResult<Value>;

export function useSearchParam<Schema extends z.ZodType>(
  name: string,
  schema: Schema,
): UseSearchParamResult<z.input<Schema>>;

export function useSearchParam<Value>(name: string, arg?: unknown): UseSearchParamResult<Value> {
  const [params, setParams] = useSearchParams();

  const param = createMemo(() => {
    const value = params[name];

    if (value === undefined || typeof value === 'string') {
      if (typeof arg === 'function') {
        return arg(value);
      }

      if (arg instanceof z.ZodType) {
        const { success, data } = arg.safeParse(value);

        if (success) {
          return data;
        } else {
          return undefined;
        }
      }
    }

    return value as Value;
  });

  const setParam = (value: Value) => {
    setParams({ ...params, [name]: value ? String(value) : undefined });
  };

  return [param, setParam];
}
