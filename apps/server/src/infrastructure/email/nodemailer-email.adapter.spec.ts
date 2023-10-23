import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigPort } from '../config/config.port';
import { StubConfigAdapter } from '../config/stub-config.adapter';

import { Email } from './email.port';
import { Nodemailer, NodemailerEmailAdapter, Transporter } from './nodemailer-email.adapter';

describe('NodemailerEmailAdapter', () => {
  let config: ConfigPort;

  beforeEach(() => {
    config = new StubConfigAdapter({
      email: {
        host: 'host',
        port: 25,
        sender: 'sender',
        password: 'password',
      },
    });
  });

  it('instanciates a nodemailer transport with the configuration values', () => {
    const createTransport = vi.fn(() => ({
      sendMail: vi.fn(),
    }));

    const nodemailer: Nodemailer = {
      createTransport,
    };

    new NodemailerEmailAdapter(config, nodemailer);

    expect(createTransport).toHaveBeenCalledWith({
      port: 25,
      host: 'host',
      secure: true,
      auth: {
        type: 'login',
        user: 'sender',
        pass: 'password',
      },
    });
  });

  it('sends an email using nodemailer', async () => {
    const sendMail: Transporter['sendMail'] = vi.fn((_, cb) => {
      cb(undefined);
    });

    const nodemailer: Nodemailer = {
      createTransport: vi.fn(() => ({
        sendMail,
      })),
    };

    const adapter = new NodemailerEmailAdapter(config, nodemailer);

    const email: Email = {
      to: 'to',
      subject: 'subject',
      body: {
        text: 'text',
        html: 'html',
      },
    };

    await expect(adapter.send(email)).resolves.toBeUndefined();

    expect(sendMail).toHaveBeenCalledWith(
      {
        from: 'sender',
        to: 'to',
        subject: 'subject',
        text: 'text',
        html: 'html',
      },
      expect.any(Function),
    );
  });
});
