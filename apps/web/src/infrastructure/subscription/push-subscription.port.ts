export interface PushSubscriptionPort {
  registerDevice(): Promise<void>;
}
