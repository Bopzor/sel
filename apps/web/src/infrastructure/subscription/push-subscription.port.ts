export interface PushSubscriptionPort {
  registerDevice(): Promise<boolean>;
  getRegistrationState(): Promise<'prompt' | 'granted' | 'denied'>;
}
