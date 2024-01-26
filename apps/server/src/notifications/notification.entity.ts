import * as shared from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';

import { NotificationDeliveryType } from '../common/notification-delivery-type';

export type Notification = {
  id: string;
  subscriptionId: string;
  memberId: string;
  type: shared.NotificationType;
  date: Date;
  deliveryType: Record<NotificationDeliveryType, boolean>;
  readAt?: Date;
  title: string;
  titleTrimmed: string;
  content: string;
  data: unknown;
};

export const createNotification = createFactory<Notification>(() => ({
  id: createId(),
  subscriptionId: '',
  memberId: '',
  type: 'NewAppVersion',
  date: createDate(),
  deliveryType: {
    [NotificationDeliveryType.email]: false,
    [NotificationDeliveryType.push]: false,
  },
  title: '',
  titleTrimmed: '',
  content: '',
  data: {},
}));
