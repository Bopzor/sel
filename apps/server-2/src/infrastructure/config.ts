import { assert } from '@sel/utils';

export interface Config {
  server: {
    host: string;
    port: number;
  };

  session: {
    secret: string;
    secure: boolean;
  };

  app: {
    baseUrl: string;
  };

  database: {
    url: string;
  };

  email: {
    sender: string;
    port: number;
    host: string;
    secure: boolean;
    password: string;
  };

  push: {
    subject: string;
    publicKey: string;
    privateKey: string;
  };
}

export function createEnvConfig(): Config {
  return {
    server: {
      host: getEnv('HOST'),
      port: getEnv('PORT', Number.parseInt),
    },

    session: {
      secret: getEnv('SESSION_SECRET'),
      secure: getEnv('SESSION_SECURE', (value) => value === 'true'),
    },

    app: {
      baseUrl: getEnv('APP_BASE_URL'),
    },

    database: {
      url: getEnv('DATABASE_URL'),
    },

    email: {
      host: getEnv('EMAIL_HOST'),
      port: getEnv('EMAIL_PORT', Number.parseInt),
      secure: getEnv('EMAIL_SECURE', (value) => value === 'true'),
      sender: getEnv('EMAIL_FROM'),
      password: getEnv('EMAIL_PASSWORD'),
    },

    push: {
      subject: getEnv('WEB_PUSH_SUBJECT'),
      publicKey: getEnv('WEB_PUSH_PUBLIC_KEY'),
      privateKey: getEnv('WEB_PUSH_PRIVATE_KEY'),
    },
  };
}

function getEnv(name: string): string;
function getEnv<T>(name: string, parse: (value: string) => T): T;

function getEnv<T>(name: string, parse?: (value: string) => T): string | T {
  const value = process.env[name];

  assert(value !== undefined, `Missing environment variable ${name}`);

  return parse ? parse(value) : value;
}
