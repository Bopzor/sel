import { Notification, UpdateMemberProfileData } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface ProfileApi {
  updateMemberProfile(memberId: string, data: UpdateMemberProfileData): Promise<void>;
  getNotifications(): Promise<[number, Notification[]]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
}

export class FetchProfileApi implements ProfileApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async updateMemberProfile(memberId: string, data: UpdateMemberProfileData): Promise<void> {
    await this.fetcher.put(`/api/members/${memberId}/profile`, data);
  }

  async getNotifications(): Promise<[number, Notification[]]> {
    const response = await this.fetcher.get<Notification[]>('/api/session/notifications');
    const count = response.headers.get('X-Unread-Notifications-Count');

    return [Number(count), response.body];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.fetcher.put(`/api/session/notifications/${notificationId}/read`);
  }
}
