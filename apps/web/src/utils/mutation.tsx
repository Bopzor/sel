import { MutationKey, QueryKey, createMutation, useQueryClient } from '@tanstack/solid-query';

import { FetcherPort } from '../fetcher';
import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

type MutationOptions<Params extends unknown[], Result> = {
  key: MutationKey;
  mutate: (...params: Params) => Promise<Result>;
  onSuccess?: () => void;
  invalidate?: QueryKey;
};

type MutationMeta = {
  isPending: boolean;
  isSuccess: boolean;
};

interface Mutate<Params extends unknown[]> {
  (...params: Params): void;
  async: (...params: Params) => Promise<void>;
}

type MutationResult<Params extends unknown[]> = [Mutate<Params>, MutationMeta];

export function mutation<Params extends unknown[], Result>(
  options: (fetcher: FetcherPort) => MutationOptions<Params, Result>
): MutationResult<Params> {
  const fetcher = container.resolve(TOKENS.fetcher);
  const notifications = container.resolve(TOKENS.notifications);

  const client = useQueryClient();

  const mutation = createMutation(() => {
    const { key, mutate, onSuccess, invalidate } = options(fetcher);

    return {
      mutationKey: key,
      mutationFn: (params: Params) => mutate(...params),
      async onSuccess() {
        if (invalidate !== undefined) {
          await client.invalidateQueries({ queryKey: invalidate });
        }

        onSuccess?.();
      },
      onError(error) {
        notifications.error(error);
      },
    };
  });

  const mutate = (...params: Params) => {
    mutation.mutate(params);
  };

  mutate.async = async (...params: Params) => {
    await mutation.mutateAsync(params);
  };

  return [mutate, mutation];
}
