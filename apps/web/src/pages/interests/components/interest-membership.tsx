import { Interest } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { useMutation } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.interests');

export function InterestMembership(props: { interest: Interest }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const member = getAuthenticatedMember();
  const memberInterest = () => member().interests.find(hasProperty('interestId', props.interest.id));

  const join = useMutation(() => ({
    async mutationFn() {
      await api.joinInterest({ path: { interestId: props.interest.id }, body: {} });
    },
    async onSuccess() {
      await Promise.all([invalidate('getAuthenticatedMember'), invalidate('listInterests')]);
      notify.success(t('join.success', { label: props.interest.label }));
    },
  }));

  const leave = useMutation(() => ({
    async mutationFn() {
      await api.leaveInterest({ path: { interestId: props.interest.id } });
    },
    async onSuccess() {
      await Promise.all([invalidate('getAuthenticatedMember'), invalidate('listInterests')]);
      notify.success(t('leave.success', { label: props.interest.label }));
    },
  }));

  return (
    <div class="row items-center gap-4 px-8 py-2">
      <Show when={!memberInterest()}>
        <>
          <p class="text-dim">
            <T id="join.description" />
          </p>
          <Button
            variant="ghost"
            size="small"
            loading={join.isPending}
            onClick={() => join.mutate()}
            class="self-start"
          >
            <T id="join.button" />
          </Button>
        </>
      </Show>

      <Show when={memberInterest()}>
        <>
          <p class="text-dim">
            <T id="leave.description" />
          </p>
          <Button
            variant="ghost"
            size="small"
            loading={leave.isPending}
            onClick={() => leave.mutate()}
            class="self-start"
          >
            <T id="leave.button" />
          </Button>
        </>
      </Show>
    </div>
  );
}
