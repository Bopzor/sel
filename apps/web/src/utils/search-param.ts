import { useSearchParams } from '@solidjs/router';
import { Accessor, createMemo } from 'solid-js';

type UseSearchParamResult<Value> = [param: Accessor<Value>, setParam: (param: Value) => void];

export function useSearchParam(name: string): UseSearchParamResult<string | undefined>;

export function useSearchParam<Value>(
  name: string,
  parse: (value: string | undefined) => Value,
): UseSearchParamResult<Value>;

export function useSearchParam<Value>(
  name: string,
  parse?: (value: string | undefined) => Value,
): UseSearchParamResult<Value> {
  const [params, setParams] = useSearchParams();

  const param = createMemo(() => {
    const value = params[name];

    if ((value === undefined || typeof value === 'string') && parse) {
      return parse(value);
    }

    return value as Value;
  });

  const setParam = (value: Value) => {
    setParams({ [name]: value ? String(value) : undefined });
  };

  return [param, setParam];
}
