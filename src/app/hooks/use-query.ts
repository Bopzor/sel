import { Token } from 'brandi';
import { useInjection } from 'brandi-react';
import { useQuery as useReactQuery } from 'react-query';

type AsyncResource<Data> = [Data | undefined, { loading: boolean; error: unknown }];

type Methods<Service> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Key in keyof Service]: Service[Key] extends (...args: any[]) => any ? Service[Key] : never;
};

type UseQuery = <Service, ServiceMethods extends Methods<Service>, Method extends keyof ServiceMethods>(
  token: Token<Service>,
  method: Method,
  ...params: Parameters<ServiceMethods[Method]>
) => AsyncResource<Awaited<ReturnType<ServiceMethods[Method]>>>;

export const useQuery: UseQuery = (token, method, ...params) => {
  const service = useInjection(token) as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [method in typeof method]: (...args: typeof params) => any;
  };

  const result = useReactQuery([token, method, params], () => service[method](...params), {
    retry: false,
  });

  return [
    result.data,
    {
      loading: result.isLoading,
      error: result.error,
    },
  ];
};
