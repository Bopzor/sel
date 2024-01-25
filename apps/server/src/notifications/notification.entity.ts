import * as shared from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';

export type Notification = {
  id: string;
  subscriptionId: string;
  memberId: string;
  type: shared.NotificationType;
  date: Date;
  readAt?: Date;
  content: string;
  title: string;
  data: unknown;
};

export const createNotification = createFactory<Notification>(() => ({
  id: createId(),
  subscriptionId: '',
  type: 'NewAppVersion',
  memberId: '',
  content: '',
  title: '',
  date: createDate(),
  data: {},
}));
