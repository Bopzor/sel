export type PushDeviceSubscription = unknown;

export interface PushNotificationPort {
  init?(): void;
  send(subscription: PushDeviceSubscription, title: string, content: string): Promise<void>;
}
