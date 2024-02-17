export interface ConfigPort {
  analytics: {
    url?: string;
    siteId?: number;
  };

  geoapify: {
    apiKey: string;
  };

  push: {
    publicKey: string;
  };
}
