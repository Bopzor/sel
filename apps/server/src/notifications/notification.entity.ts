import * as shared from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';

export type Notification = {
  id: string;
  subscriptionId: string;
  memberId: string;
  type: shared.NotificationType;
  date: Date;
  readAt?: Date;
  title: string;
  titleTrimmed: string;
  content: string;
  data: unknown;
};

export const createNotification = createFactory<Notification>(() => ({
  id: createId(),
  subscriptionId: '',
  type: 'NewAppVersion',
  memberId: '',
  content: '',
  title: '',
  titleTrimmed: '',
  date: createDate(),
  data: {},
}));
