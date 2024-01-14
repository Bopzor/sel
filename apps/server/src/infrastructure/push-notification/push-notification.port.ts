export type PushDeviceSubscription = unknown;

export interface PushNotificationPort {
  send(subscription: PushDeviceSubscription, title: string, content: string): Promise<void>;
}
