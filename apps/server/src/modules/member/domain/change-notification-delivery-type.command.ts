import { entries } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { NotificationDeliveryType } from 'src/modules/notification/notification.entities';
import { TOKENS } from 'src/tokens';

import { NotificationDeliveryTypeChangedEvent } from '../member.entities';
import { updateMember } from '../member.persistence';

export type ChangeNotificationDeliveryTypeCommand = {
  memberId: string;
  notificationDeliveryType: Partial<Record<NotificationDeliveryType, boolean>>;
};

export async function changeNotificationDeliveryType(
  command: ChangeNotificationDeliveryTypeCommand,
): Promise<void> {
  const { memberId, notificationDeliveryType } = command;
  const events = container.resolve(TOKENS.events);

  await updateMember(memberId, {
    notificationDelivery: entries(notificationDeliveryType)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type),
  });

  events.publish(new NotificationDeliveryTypeChangedEvent(memberId, { notificationDeliveryType }));
}
