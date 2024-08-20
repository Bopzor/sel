import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { inArray, InferSelectModel } from 'drizzle-orm';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { reporter } from 'vfile-reporter';

import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { EmailRendererPort } from '../infrastructure/email/email-renderer.port';
import { EmailSenderPort } from '../infrastructure/email/email-sender.port';
import { PushNotificationPort } from '../infrastructure/push-notification/push-notification.port';
import { Database } from '../persistence/database';
import * as schema from '../persistence/schema';
import { TOKENS } from '../tokens';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

type Member = InferSelectModel<typeof schema.members>;
type MemberDevice = InferSelectModel<typeof schema.memberDevices>;

export type NotificationType = 'Test';

type Context = Record<string, string>;

type NotificationContextMap = {
  Test: {
    name: string;
    link: string;
    content: string;
  };
};

export type NotificationContext<Type extends NotificationType> = NotificationContextMap[Type];

export class NotificationService {
  static inject = injectableClass(
    this,
    TOKENS.database,
    TOKENS.pushNotification,
    TOKENS.emailRenderer,
    TOKENS.emailSender,
  );

  constructor(
    private readonly database: Database,
    private readonly pushNotification: PushNotificationPort,
    private readonly emailRenderer: EmailRendererPort,
    private readonly emailSender: EmailSenderPort,
  ) {}

  async notify<Type extends NotificationType>(
    memberIds: string[] | null,
    type: Type,
    context: NotificationContext<Type>,
  ) {
    const template = await this.loadTemplate(type);

    const members = await this.database.db.query.members.findMany({
      where: memberIds ? inArray(schema.members.id, memberIds) : undefined,
      with: { devices: true },
    });

    await Promise.allSettled(
      members.flatMap((member) => [
        this.sendPushNotification(member, template.push, context),
        this.sendEmailNotification(member, template.email, context),
      ]),
    );
  }

  private async loadTemplate(type: NotificationType): Promise<{ push: string; email: string }> {
    const file = String(await fs.readFile(path.join(dirname, 'templates', type + '.md')));
    const [push, email] = file.split('\n--\n', 2).map((str) => str.trim());

    return { push, email };
  }

  private async sendPushNotification(
    member: Member & { devices: MemberDevice[] },
    template: string,
    context: Context,
  ) {
    if (!member.notificationDelivery.includes(NotificationDeliveryType.push)) {
      return;
    }

    const [title, link, body] = this.getPushContent(template, context);

    await Promise.allSettled(
      member.devices
        .map((device) => device.deviceSubscription)
        .map((subscription) => JSON.parse(subscription))
        .map((subscription) => this.pushNotification.send(subscription, title, body, link)),
    );
  }

  private getPushContent(template: string, context: Context): string[] {
    const [title, link, ...body] = template.split('\n');

    return [title.replace(/^# /, ''), link, body.join('\n').trim()].map((str) =>
      this.replaceVariables(str, context),
    );
  }

  private async sendEmailNotification(member: Member, template: string, context: Context) {
    if (!member.notificationDelivery.includes(NotificationDeliveryType.email)) {
      return;
    }

    const [subject, body] = this.getEmailContent(template, context);
    const html = await this.markdownToHtml(body);

    const email = this.emailRenderer.render2({
      subject,
      html: html,
      text: body,
    });

    await this.emailSender.send({
      to: member.email,
      ...email,
    });
  }

  private getEmailContent(template: string, context: Context): string[] {
    const [title, ...body] = template.split('\n');

    return [title.replace(/^# /, ''), body.join('\n').trim()].map((str) =>
      this.replaceVariables(str, context),
    );
  }

  private replaceVariables(template: string, context: Context): string {
    const getValue = (_: string, key: string) => {
      assert(key in context, `Missing context value for key ${key}`);
      return context[key];
    };

    return template.replaceAll(/\{([^}]+)\}/g, getValue);
  }

  private async markdownToHtml(markdown: string): Promise<string> {
    const file = await unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).process(markdown);

    const status = reporter(file);

    if (status !== 'no issues found') {
      throw new Error(status);
    }

    return String(file);
  }
}
