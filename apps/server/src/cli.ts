import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Readable } from 'node:stream';

import { MemberRole } from '@sel/shared';
import { program } from 'commander';
import { eq } from 'drizzle-orm';

import { container } from './infrastructure/container';
import { Email } from './infrastructure/email';
import { changeMemberRole } from './modules/member/domain/change-member-role.command';
import { createMember } from './modules/member/domain/create-member.command';
import { setAttachments } from './modules/messages/domain/insert-attachments.command';
import { createTransaction } from './modules/transaction/domain/create-transaction.command';
import { db, schema } from './persistence';
import { TOKENS } from './tokens';

program.name('lets');
program.description('A CLI for the Local Exchange Trading System');

program.hook('postAction', async () => {
  await db.$client.end();
});

program
  .command('send-push')
  .description('Send a test push notification to a member')
  .argument('<memberId>', 'Member id')
  .requiredOption('-t, --title <title>', 'Notification title')
  .requiredOption('-c, --content <content>', 'Notification content')
  .requiredOption('-l, --link <link>', 'Link to open when the notification is clicked')
  .action(async (memberId, { title, content, link }) => {
    const pushNotification = container.resolve(TOKENS.pushNotification);

    const member = await db.query.members.findFirst({
      where: eq(schema.members.id, memberId),
      with: { devices: true },
    });

    if (!member) {
      throw new Error(`Member with id ${memberId} not found`);
    }

    pushNotification.init?.();

    await Promise.all(
      member.devices.map(async (device) => {
        await pushNotification.send(device.deviceSubscription, title, content, link);
      }),
    );
  });

program
  .command('send-email')
  .description('Send a test email to a member')
  .argument('<email>', "Recipient's email address")
  .requiredOption('-s, --subject <subject>', 'Email subject')
  .requiredOption('-b, --body <body>', 'Email body')
  .option('-f, --file <path...>', 'Email attachments')
  .action(async (email, { subject, body, file = [] }) => {
    const emailSender = container.resolve(TOKENS.emailSender);
    const files: string[] = file;

    const attachments: Email['attachments'] = await Promise.all(
      files.map(async (path) => ({
        filename: basename(path),
        content: Readable.from(await readFile(path)),
      })),
    );

    await emailSender.send({
      to: email,
      subject,
      text: body,
      html: body,
      attachments,
    });
  });

program
  .command('create-member')
  .description('Create a new member')
  .requiredOption('-e, --email <email>', "Recipient's email address")
  .option('-f, --first-name [firstName]', "Member's first name")
  .option('-l, --last-name [lastName]', "Member's last name")
  .option('-s, --system', 'Create a system member')
  .action(async ({ email, firstName, lastName, system }) => {
    const memberId = container.resolve(TOKENS.generator).id();

    await createMember({
      memberId,
      email,
      firstName,
      lastName,
    });

    if (system) {
      await changeMemberRole({
        memberId,
        roles: [MemberRole.system],
      });
    }
  });

program
  .command('create-transaction')
  .description('Create a transaction between two members')
  .argument('<amount>', 'Amount', Number.parseInt)
  .argument('<description>', 'Description')
  .requiredOption('-p, --payer <id>', 'Payer id')
  .requiredOption('-r, --recipient <id>', 'Recipient id')
  .option('-c, --creator <id>', 'Creator id (defaults to payer)')
  .action(
    async (amount, description, { payer: payerId, recipient: recipientId, creator: creatorId = payerId }) => {
      const transactionId = container.resolve(TOKENS.generator).id();

      await createTransaction({
        transactionId,
        payerId,
        recipientId,
        creatorId,
        amount,
        description,
      });
    },
  );

program
  .command('set-attachments')
  .description('Set existing files as attachments to an existing message')
  .requiredOption('-f, --files <id...>', 'File ids')
  .requiredOption('-m, --message <id>', 'Message id')
  .action(async ({ files: fileIds, message: messageId }) => {
    await setAttachments({ messageId, fileIds });
  });

await program.parseAsync();
