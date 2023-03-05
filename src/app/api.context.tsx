import { createContext, useCallback, useContext } from 'react';
import { useQuery as useReactQuery } from 'react-query';

import { assert } from '../common/assert';
import { CommandHandler } from '../common/cqs/command-handler';
import { QueryHandler } from '../common/cqs/query-handler';

export type ClassType<T> = {
  new (...args: any[]): T;
};

export interface QueryBus {
  execute<Query extends object, Result>(
    Handler: ClassType<QueryHandler<Query, Result>>,
    query: Query
  ): Promise<Result>;
}

export interface CommandBus {
  execute<Command extends object>(
    Handler: ClassType<CommandHandler<Command>>,
    command: Command
  ): Promise<void>;
}

export type ApiContext = {
  queryBus: QueryBus;
  commandBus: CommandBus;
};

const apiContext = createContext<ApiContext | null>(null);

type ApiProviderProps = {
  value: ApiContext;
  children: React.ReactNode;
};

export const ApiProvider = ({ value, children }: ApiProviderProps) => (
  <apiContext.Provider value={value}>{children}</apiContext.Provider>
);

const useApiContext = () => {
  const result = useContext(apiContext);

  assert(result !== null);

  return result;
};

type AsyncResource<Data> = [Data | undefined, { loading: boolean; error: unknown }];

export const useQuery = <Query extends object, Result>(
  Handler: ClassType<QueryHandler<Query, Result>>,
  query: Query
): AsyncResource<Result> => {
  const { queryBus } = useApiContext();

  const result = useReactQuery<Result>([Handler.name, query], () => queryBus.execute(Handler, query), {
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

export const useExecuteCommand = <Command extends object>(Handler: ClassType<CommandHandler<Command>>) => {
  const { commandBus } = useApiContext();

  return useCallback(
    (command: Command) => {
      return commandBus.execute(Handler, command);
    },
    [commandBus, Handler]
  );
};
