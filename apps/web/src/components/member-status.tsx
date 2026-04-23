import { MemberStatus as MemberStatusEnum } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { check, cog_6Tooth, exclamationTriangle, xMark } from 'solid-heroicons/solid';

import { TranslateEnum } from 'src/intl/enums';

export function MemberStatus(props: { status: MemberStatusEnum }) {
  const icons = {
    [MemberStatusEnum.active]: check,
    [MemberStatusEnum.onboarding]: exclamationTriangle,
    [MemberStatusEnum.inactive]: xMark,
    [MemberStatusEnum.system]: cog_6Tooth,
  };

  return (
    <div class="inline-flex flex-row items-center gap-2">
      <div>
        <Icon
          path={icons[props.status]}
          class="size-5 stroke-2"
          classList={{
            'text-emerald-600': props.status === MemberStatusEnum.active,
            'text-amber-600': props.status === MemberStatusEnum.onboarding,
            'text-dim': props.status === MemberStatusEnum.inactive,
          }}
        />
      </div>

      <TranslateEnum enum="memberStatus" value={props.status} />
    </div>
  );
}
