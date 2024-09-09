import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import * as shared from '@sel/shared';
import { assert, defined, hasProperty, toObject } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq, inArray } from 'drizzle-orm';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { reporter } from 'vfile-reporter';

import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { ConfigPort } from '../infrastructure/config/config.port';
import { DatePort } from '../infrastructure/date/date.port';
import { EmailRendererPort } from '../infrastructure/email/email-renderer.port';
import { EmailSenderPort } from '../infrastructure/email/email-sender.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { LoggerPort } from '../infrastructure/logger/logger.port';
import {
  PushDeviceSubscription,
  PushNotificationPort,
} from '../infrastructure/push-notification/push-notification.port';
import { Database } from '../persistence/database';
import * as schema from '../persistence/schema';
import { TOKENS } from '../tokens';

// cspell:word rehype vfile

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

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
  (member: typeof schema.members.$inferSelect): shared.NotificationData[Type] | null;
}

export class NotificationService {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.generator,
    TOKENS.logger,
    TOKENS.date,
    TOKENS.database,
    TOKENS.pushNotification,
    TOKENS.emailRenderer,
    TOKENS.emailSender,
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly generator: GeneratorPort,
    private readonly logger: LoggerPort,
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly pushNotification: PushNotificationPort,
    private readonly emailRenderer: EmailRendererPort,
    private readonly emailSender: EmailSenderPort,
  ) {}

  private get commonContext() {
    return {
      appBaseUrl: this.config.app.baseUrl,
    };
  }

  async notify<Type extends shared.NotificationType>(
    memberIds: string[] | null,
    type: Type,
    getContext: GetNotificationContext<Type>,
  ) {
    const template = await this.loadTemplate(type);

    const members = await this.database.db.query.members.findMany({
      where: memberIds ? inArray(schema.members.id, memberIds) : undefined,
      with: { devices: true },
    });

    const now = this.dateAdapter.now();
    const notifications = new Array<typeof schema.notifications.$inferInsert>();
    const deliveries = new Array<typeof schema.notificationDeliveries.$inferInsert>();

    for (const member of members) {
      const context = getContext(member);

      if (member.notificationDelivery.length === 0 || context === null) {
        continue;
      }

      const notificationId = this.generator.id();

      notifications.push({
        id: notificationId,
        memberId: member.id,
        type,
        date: now,
        context: { ...this.commonContext, ...context },
        createdAt: now,
        updatedAt: now,
      });

      if (member.notificationDelivery.includes(NotificationDeliveryType.email)) {
        deliveries.push({
          id: this.generator.id(),
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
            id: this.generator.id(),
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
      await this.database.db.insert(schema.notifications).values(notifications);
    }

    if (deliveries.length > 0) {
      await this.database.db.insert(schema.notificationDeliveries).values(deliveries);
    }

    const results = await Promise.allSettled(
      deliveries.map(async (delivery) => {
        const notification = notifications.find(hasProperty('id', delivery.notificationId));
        const context = defined(notification).context;

        await this.deliverNotification(delivery, template, context);
      }),
    );

    const deliveredIds = results
      .map((result, index) => [result, deliveries[index].id] as const)
      .filter(([result]) => result.status === 'fulfilled')
      .map(([, deliveryId]) => deliveryId);

    if (deliveredIds.length > 0) {
      const now = this.dateAdapter.now();

      await this.database.db
        .update(schema.notificationDeliveries)
        .set({ delivered: true, updatedAt: now })
        .where(inArray(schema.notificationDeliveries.id, deliveredIds));
    }
  }

  private async loadTemplate(type: shared.NotificationType): Promise<NotificationTemplate> {
    const file = String(await fs.readFile(path.join(dirname, 'templates', type + '.md')));
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

  private async deliverNotification(
    delivery: typeof schema.notificationDeliveries.$inferInsert,
    template: NotificationTemplate,
    context: Context,
  ) {
    try {
      if (delivery.type === NotificationDeliveryType.push) {
        await this.deliverPushNotification(delivery.target, template.push, context);
      }

      if (delivery.type === NotificationDeliveryType.email) {
        await this.deliverEmailNotification(delivery.target, template.email, context);
      }
    } catch (error) {
      await this.handleDeliveryError(delivery.id, error);
      throw error;
    }
  }

  private async handleDeliveryError(deliveryId: string, error: unknown) {
    assert(error instanceof Error);

    this.logger.error('Failed to deliver notification', error);

    await this.database.db
      .update(schema.notificationDeliveries)
      .set({ error: JSON.stringify({ message: error.message, stack: error.stack }) })
      .where(eq(schema.notificationDeliveries.id, deliveryId));
  }

  private async deliverPushNotification(
    subscription: PushDeviceSubscription,
    template: NotificationTemplate['push'],
    context: Context,
  ) {
    const { title, content, link } = this.getPushContent(template, context);

    await this.pushNotification.send(subscription, title, content, link);
  }

  private getPushContent(template: NotificationTemplate['push'], context: Context) {
    return {
      title: this.replaceVariables(template.title, context),
      content: this.replaceVariables(template.content, context),
      link: this.replaceVariables(template.link, context),
    };
  }

  private async deliverEmailNotification(
    emailAddress: string,
    template: NotificationTemplate['email'],
    context: Context,
  ) {
    const { subject, html, text } = await this.getEmailContent(template, context);

    await this.emailSender.send({
      to: emailAddress,
      subject,
      html,
      text,
    });
  }

  private async getEmailContent(template: NotificationTemplate['email'], context: Context) {
    const subject = this.replaceVariables(template.subject, context);

    const html = await this.markdownToHtml(
      this.replaceVariables(template.body, {
        ...context,
        verbatim: (obj: { html: string }) => obj.html,
      }),
    );

    const text = this.replaceVariables(template.body, {
      ...context,
      verbatim: (obj: { text: string }) => obj.text,
    });

    return {
      subject,
      html: this.emailRenderer.renderHtml(
        subject,
        ['<!-- CONTENT START -->', html, '<!-- CONTENT END -->'].join('\n'),
      ),
      text: this.emailRenderer.renderText(text),
    };
  }

  private replaceVariables(template: string, context: Context): string {
    const getValue = (_: string, key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      return new Function(...Object.keys(context), `return ${key}`)(...Object.values(context));
    };

    return template.replaceAll(/\{([^}]+)\}/g, getValue);
  }

  private async markdownToHtml(markdown: string): Promise<string> {
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
}
