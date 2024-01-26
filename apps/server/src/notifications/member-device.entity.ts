import { createFactory, createId } from '@sel/utils';

import { PushDeviceSubscription } from '../infrastructure/push-notification/push-notification.port';

export type MemberDevice = {
  id: string;
  memberId: string;
  subscription: PushDeviceSubscription;
};

export const createMemberDevice = createFactory<MemberDevice>(() => ({
  id: createId(),
  memberId: '',
  subscription: null,
}));
