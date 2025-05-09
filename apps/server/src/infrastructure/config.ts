import { assert } from '@sel/utils';

export interface Config {
  server: {
    host: string;
    port: number;
  };

  files: {
    uploadDir: string;
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
    debug: boolean;
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

  slack: {
    webhookUrl: string;
  };

  minio: {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucketName: string;
  };
}

export function createEnvConfig(): Config {
  return {
    server: {
      host: getEnv('HOST'),
      port: getEnv('PORT', Number.parseInt),
    },

    files: {
      uploadDir: getEnv('FILES_UPLOAD_DIR'),
    },

    session: {
      secret: getEnv('SESSION_SECRET'),
      secure: getEnv('SESSION_SECURE', parseBoolean),
    },

    app: {
      baseUrl: getEnv('APP_BASE_URL'),
    },

    database: {
      url: getEnv('DATABASE_URL'),
      debug: getEnv('DATABASE_DEBUG', parseBoolean),
    },

    email: {
      host: getEnv('EMAIL_HOST'),
      port: getEnv('EMAIL_PORT', Number.parseInt),
      secure: getEnv('EMAIL_SECURE', parseBoolean),
      sender: getEnv('EMAIL_FROM'),
      password: getEnv('EMAIL_PASSWORD'),
    },

    push: {
      subject: getEnv('WEB_PUSH_SUBJECT'),
      publicKey: getEnv('WEB_PUSH_PUBLIC_KEY'),
      privateKey: getEnv('WEB_PUSH_PRIVATE_KEY'),
    },

    slack: {
      webhookUrl: getEnv('SLACK_WEBHOOK_URL'),
    },

    minio: {
      endPoint: getEnv('MINIO_ENDPOINT'),
      port: getEnv('MINIO_PORT', Number.parseInt),
      useSSL: getEnv('MINIO_USE_SSL', parseBoolean),
      accessKey: getEnv('MINIO_ACCESS_KEY'),
      secretKey: getEnv('MINIO_SECRET_KEY'),
      bucketName: getEnv('MINIO_BUCKET_NAME'),
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

function parseBoolean(value: string) {
  return value === 'true';
}
