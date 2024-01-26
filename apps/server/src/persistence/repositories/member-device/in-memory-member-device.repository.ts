import { hasProperty } from '@sel/utils';

import { InMemoryRepository } from '../../../in-memory.repository';
import { MemberDevice } from '../../../notifications/member-device.entity';

import { MemberDeviceRepository } from './member-device.repository';

export class InMemoryMemberDeviceRepository
  extends InMemoryRepository<MemberDevice>
  implements MemberDeviceRepository
{
  register(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getMemberDeviceSubscriptions(memberId: string): Promise<unknown[]> {
    return this.filter(hasProperty('memberId', memberId)).map(({ subscription }) => subscription);
  }
}
