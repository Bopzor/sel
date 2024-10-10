import { program } from 'commander';
import { eq } from 'drizzle-orm';

import { container } from './infrastructure/container';
import { createMember } from './modules/member/domain/create-member.command';
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
  .action(async (email, { subject, body }) => {
    const emailSender = container.resolve(TOKENS.emailSender);

    await emailSender.send({
      to: email,
      subject,
      text: body,
      html: body,
    });
  });

program
  .command('create-member')
  .description('Create a new member')
  .requiredOption('-e, --email <email>', "Recipient's email address")
  .option('-f, --first-name [firstName]', "Member's first name")
  .option('-l, --last-name [lastName]', "Member's last name")
  .action(async ({ email, firstName, lastName }) => {
    const memberId = container.resolve(TOKENS.generator).id();

    await createMember({
      memberId,
      email,
      firstName,
      lastName,
    });
  });

await program.parseAsync();
