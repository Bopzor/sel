export type PushDeviceSubscription = unknown;
export type DeviceType = 'mobile' | 'desktop';

export interface PushNotificationPort {
  init?(): void;
  send(subscription: PushDeviceSubscription, title: string, content: string, link: string): Promise<void>;
}
