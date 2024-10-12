export interface ConfigPort {
  api: {
    url: string;
  };

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
