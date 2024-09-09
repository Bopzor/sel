import { UpdateMemberProfileData, UpdateNotificationDeliveryData } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface ProfileApi {
  updateMemberProfile(memberId: string, data: UpdateMemberProfileData): Promise<void>;
  updateNotificationDelivery(
    memberId: string,
    notificationDelivery: UpdateNotificationDeliveryData,
  ): Promise<void>;
}

export class FetchProfileApi implements ProfileApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async updateMemberProfile(memberId: string, data: UpdateMemberProfileData): Promise<void> {
    await this.fetcher.put(`/api/members/${memberId}/profile`, data);
  }

  async updateNotificationDelivery(memberId: string, data: UpdateNotificationDeliveryData): Promise<void> {
    await this.fetcher.put(`/api/members/${memberId}/notification-delivery`, data);
  }
}
