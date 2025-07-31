import fs from 'node:fs/promises';
import path from 'node:path';

import * as shared from '@sel/shared';
import { assert, defined, hasProperty, toObject } from '@sel/utils';
import { eq, inArray } from 'drizzle-orm';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { reporter } from 'vfile-reporter';

import { container } from 'src/infrastructure/container';
import { Email } from 'src/infrastructure/email';
import { PushDeviceSubscription } from 'src/infrastructure/push-notification';
import { File } from 'src/modules/file/file.entity';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { Member } from '../../member/member.entities';
import {
  NotificationDeliveryInsert,
  NotificationDeliveryType,
  NotificationInsert,
} from '../notification.entities';

// cspell:word rehype vfile

type Context = Record<string, unknown>;

type NotificationTemplate = {
  push: {
    title: string;
    content: string;
    link: string;
  };
  email: {
    subject: string;
    body: string;
  };
};

export interface GetNotificationContext<Type extends shared.NotificationType> {
  (member: Member): shared.NotificationData[Type] | null;
}

type NotifyParams<Type extends shared.NotificationType> = {
  memberIds?: string[];
  type: Type;
  getContext: GetNotificationContext<Type>;
  attachments?: Array<{ file: File }>;
};

export async function notify<Type extends shared.NotificationType>({
  memberIds,
  type,
  getContext,
  attachments,
}: NotifyParams<Type>) {
  const config = container.resolve(TOKENS.config);
  const dateAdapter = container.resolve(TOKENS.date);
  const generator = container.resolve(TOKENS.generator);

  const template = await loadTemplate(type);

  const members = await db.query.members.findMany({
    where: memberIds ? inArray(schema.members.id, memberIds) : undefined,
    with: { devices: true },
  });

  const now = dateAdapter.now();
  const notifications = new Array<NotificationInsert>();
  const deliveries = new Array<NotificationDeliveryInsert>();

  const commonContext = {
    appBaseUrl: config.app.baseUrl,
  };

  for (const member of members) {
    const context = getContext(member);

    if (member.notificationDelivery.length === 0 || context === null) {
      continue;
    }

    const notificationId = generator.id();

    notifications.push({
      id: notificationId,
      memberId: member.id,
      type,
      date: now,
      context: { ...commonContext, ...context },
      createdAt: now,
      updatedAt: now,
    });

    if (member.notificationDelivery.includes(NotificationDeliveryType.email)) {
      deliveries.push({
        id: generator.id(),
        notificationId,
        type: NotificationDeliveryType.email,
        target: member.email,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (member.notificationDelivery.includes(NotificationDeliveryType.push)) {
      for (const device of member.devices) {
        deliveries.push({
          id: generator.id(),
          notificationId,
          type: NotificationDeliveryType.push,
          target: device.deviceSubscription,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  if (notifications.length > 0) {
    await db.insert(schema.notifications).values(notifications);
  }

  if (deliveries.length > 0) {
    await db.insert(schema.notificationDeliveries).values(deliveries);
  }

  const results = await Promise.allSettled(
    deliveries.map(async (delivery) => {
      const notification = notifications.find(hasProperty('id', delivery.notificationId));
      const context = defined(notification).context;

      await deliverNotification(
        delivery,
        template,
        context,
        attachments?.map(({ file }) => file),
      );
    }),
  );

  const deliveredIds = results
    .map((result, index) => [result, deliveries[index].id] as const)
    .filter(([result]) => result.status === 'fulfilled')
    .map(([, deliveryId]) => deliveryId);

  if (deliveredIds.length > 0) {
    const now = dateAdapter.now();

    await db
      .update(schema.notificationDeliveries)
      .set({ delivered: true, updatedAt: now })
      .where(inArray(schema.notificationDeliveries.id, deliveredIds));
  }
}

async function loadTemplate(type: shared.NotificationType): Promise<NotificationTemplate> {
  const file = String(await fs.readFile(path.resolve(__dirname, '..', 'templates', type + '.md')));
  const [, metadataString, emailBody] = file.split('---\n');

  const metadata = toObject(
    metadataString.split('\n').filter(Boolean),
    (line) => line.slice(0, line.indexOf(':')).trim(),
    (line) => line.slice(line.indexOf(':') + 1).trim(),
  );

  for (const key of ['title', 'content', 'link', 'subject']) {
    assert(key in metadata, `Missing ${key} metadata in notification template ${type}`);
  }

  return {
    push: {
      title: metadata.title,
      content: metadata.content,
      link: metadata.link,
    },
    email: {
      subject: metadata.subject,
      body: emailBody.trim(),
    },
  };
}

async function deliverNotification(
  delivery: typeof schema.notificationDeliveries.$inferInsert,
  template: NotificationTemplate,
  context: Context,
  attachments?: File[],
) {
  try {
    if (delivery.type === NotificationDeliveryType.push) {
      await deliverPushNotification(delivery.target, template.push, context);
    }

    if (delivery.type === NotificationDeliveryType.email) {
      await deliverEmailNotification(delivery.target, template.email, context, attachments);
    }
  } catch (error) {
    await handleDeliveryError(delivery.id, error);
    throw error;
  }
}

async function handleDeliveryError(deliveryId: string, error: unknown) {
  const logger = container.resolve(TOKENS.logger);

  assert(error instanceof Error);

  logger.error('Failed to deliver notification', error);

  await db
    .update(schema.notificationDeliveries)
    .set({ error: { message: error.message, stack: error.stack } })
    .where(eq(schema.notificationDeliveries.id, deliveryId));
}

async function deliverPushNotification(
  subscription: PushDeviceSubscription,
  template: NotificationTemplate['push'],
  context: Context,
) {
  const pushNotification = container.resolve(TOKENS.pushNotification);
  const { title, content, link } = getPushContent(template, context);

  await pushNotification.send(subscription, title, content, link);
}

function getPushContent(template: NotificationTemplate['push'], context: Context) {
  return {
    title: replaceVariables(template.title, context),
    content: replaceVariables(template.content, context),
    link: replaceVariables(template.link, context),
  };
}

async function deliverEmailNotification(
  emailAddress: string,
  template: NotificationTemplate['email'],
  context: Context,
  attachments?: File[],
) {
  const emailSender = container.resolve(TOKENS.emailSender);
  const { subject, html, text } = await getEmailContent(template, context);
  const emailAttachments = await getEmailAttachments(attachments);

  await emailSender.send({
    to: emailAddress,
    subject,
    html,
    text,
    attachments: emailAttachments,
  });
}

async function getEmailContent(template: NotificationTemplate['email'], context: Context) {
  const emailRenderer = container.resolve(TOKENS.emailRenderer);
  const subject = replaceVariables(template.subject, context);

  const html = await markdownToHtml(
    replaceVariables(template.body, {
      ...context,
      verbatim: (obj: { html: string }) => obj.html,
    }),
  );

  const text = replaceVariables(template.body, {
    ...context,
    verbatim: (obj: { text: string }) => obj.text,
  });

  return {
    subject,
    html: emailRenderer.renderHtml(
      subject,
      ['<!-- CONTENT START -->', html, '<!-- CONTENT END -->'].join('\n'),
    ),
    text: emailRenderer.renderText(text),
  };
}

async function getEmailAttachments(attachments?: File[]): Promise<Email['attachments']> {
  const storage = container.resolve(TOKENS.storage);

  if (!attachments || attachments.length === 0) {
    return;
  }

  return Promise.all(
    attachments.map(async (file) => ({
      filename: file.name,
      content: await storage.getFile(file.name),
    })),
  );
}

function replaceVariables(template: string, context: Context): string {
  const getValue = (_: string, key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function(...Object.keys(context), `return ${key}`)(...Object.values(context));
  };

  return template.replaceAll(/\{([^}]+)\}/g, getValue);
}

async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  const status = reporter(file);

  if (status !== 'no issues found') {
    throw new Error(status);
  }

  return String(file);
}
