import { PushDeviceSubscription } from '../infrastructure/push-notification/push-notification.port';

export type InsertMemberDeviceModel = {
  id: string;
  memberId: string;
  deviceSubscription: PushDeviceSubscription;
};

export interface MemberDeviceRepository {
  register(model: InsertMemberDeviceModel): Promise<void>;
  getMemberDeviceSubscriptions(memberId: string): Promise<unknown[]>;
}
