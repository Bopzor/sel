import { Token } from 'brandi';
import { useInjection } from 'brandi-react';
import { useCallback } from 'react';
import { useMutation as useReactMutation } from 'react-query';

import { Methods } from '../../utils/methods';

type AsyncMutation<Params extends unknown[]> = [
  (...params: Params) => Promise<void>,
  { loading: boolean; error: unknown }
];

type UseMutation = <Service, ServiceMethods extends Methods<Service>, Method extends keyof ServiceMethods>(
  token: Token<Service>,
  method: Method
) => AsyncMutation<Parameters<ServiceMethods[Method]>>;

export const useMutation: UseMutation = (token, method) => {
  const service = useInjection(token) as {
    [method in typeof method]: (...args: unknown[]) => Promise<void>;
  };

  const result = useReactMutation(async (params: unknown[]) => {
    await service[method](...params);
  });

  const mutate = result.mutate;

  return [
    useCallback(async (...params: unknown[]) => mutate(params), [mutate]),
    { loading: result.isLoading, error: result.error },
  ];
};
