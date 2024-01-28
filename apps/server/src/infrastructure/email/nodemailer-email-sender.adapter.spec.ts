import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigPort } from '../config/config.port';
import { StubConfigAdapter } from '../config/stub-config.adapter';

import { Email } from './email.types';
import { Nodemailer, NodemailerEmailSenderAdapter, Transporter } from './nodemailer-email-sender.adapter';
import { StubEmailRendererAdapter } from './stub-email-renderer.adapter';

describe('[Unit] NodemailerEmailSenderAdapter', () => {
  let config: ConfigPort;

  beforeEach(() => {
    config = new StubConfigAdapter({
      email: {
        host: 'host',
        port: 25,
        secure: true,
        sender: 'sender',
        password: 'password',
        templatesPath: '',
      },
    });
  });

  it('instantiates a nodemailer transport with the configuration values', () => {
    const createTransport = vi.fn(() => ({
      sendMail: vi.fn(),
    }));

    const nodemailer: Nodemailer = {
      createTransport,
    };

    const renderer = new StubEmailRendererAdapter();

    new NodemailerEmailSenderAdapter(config, nodemailer, renderer);

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

    const renderer = new StubEmailRendererAdapter();

    const adapter = new NodemailerEmailSenderAdapter(config, nodemailer, renderer);

    const email: Email<'test'> = {
      to: 'to',
      subject: 'subject',
      kind: 'test',
      variables: { variable: 'value' },
    };

    await expect(adapter.send(email)).resolves.toBeUndefined();

    expect(sendMail).toHaveBeenCalledWith(
      {
        from: 'sender',
        to: 'to',
        subject: 'subject',
        text: expect.stringContaining('value'),
        html: expect.stringContaining('value'),
      },
      expect.any(Function)
    );
  });
});
