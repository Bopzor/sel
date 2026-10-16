import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { Card, Icon, IconButton, LinkButton, ListItem, showToast, type IconName } from '@sel/ui';
import clsx from 'clsx';

import { useConfig } from 'src/app/config';
import { routes } from 'src/app/routes';
import { useSession } from 'src/app/session';
import { Link } from 'src/components/link';
import { PageTitle } from 'src/components/page-title';
import { Unit } from 'src/components/unit';
import { useClipboard } from 'src/hooks/use-clipboard';

export function HelpPage() {
  return (
    <div className="stack gap-6">
      <PageTitle title={msg`Help`} />

      <h1 className="text-title-1">
        <Trans>Help</Trans>
      </h1>

      {/* Below xl, the aside's sections are placed around the main column: contact first, feedback last. */}
      <div className="stack gap-6 xl:flex-row xl:items-start xl:gap-10">
        <aside className="contents xl:sticky xl:top-10 xl:order-last xl:stack xl:w-aside xl:shrink-0 xl:gap-6">
          <ContactSection />
          <FeedbackSection className="order-last xl:order-0" />
        </aside>

        <div className="stack max-w-content min-w-0 flex-1 gap-6">
          <OverviewSection />
          <GoodToKnowSection />
        </div>
      </div>
    </div>
  );
}

function ContactSection() {
  const { t } = useLingui();
  const { letsName, contactEmail } = useConfig();
  const clipboard = useClipboard();

  return (
    <Card.Root id="contact" role="region" aria-labelledby="contact-title">
      <Card.Header>
        <Card.Title level={2} id="contact-title">
          <Trans>Need help?</Trans>
        </Card.Title>
        <Card.Description>
          <Trans>A question, something you can't manage to do? Write to us, we'll answer you.</Trans>
        </Card.Description>
      </Card.Header>

      <Card.Body className="row flex-wrap items-center gap-x-8 gap-y-4">
        <LinkButton href={mailto(contactEmail, t`[${letsName}] Help request`)} icon="email">
          <Trans>Write to us</Trans>
        </LinkButton>

        <p className="row min-w-0 items-center gap-2">
          <span className="truncate text-body-strong">{contactEmail}</span>
          <IconButton
            icon="copy"
            label={t`Copy the email address`}
            size="sm"
            onClick={() => clipboard.copy(contactEmail, () => showToast(t`Email address copied`))}
          />
        </p>
      </Card.Body>
    </Card.Root>
  );
}

function OverviewSection() {
  const units = <Unit plural />;

  return (
    <section>
      <h2 className="my-2 text-title-3">
        <Trans>How it works</Trans>
      </h2>

      <Card.Root className="block py-2">
        <Topic title={<Trans>Asking for a service</Trans>}>
          <p>
            <Trans>
              Post a <Link href={routes.requests()}>request</Link> describing what you need. The members who
              can help tell you so, and you contact them to arrange the details. Close the request once you've
              been helped.
            </Trans>
          </p>
        </Topic>

        <Topic title={<Trans>Helping a member</Trans>}>
          <p>
            <Trans>
              Open a request and answer “I can help”. The member who asked is notified, and you get in touch
              to arrange the details.
            </Trans>
          </p>
        </Topic>

        <Topic title={<Trans>Exchanging {units}</Trans>}>
          <p>
            <Trans>
              Once a service is done, the member who received it pays the other one. Tap “Exchange {units}” on
              the home page or on the member's profile.
            </Trans>
          </p>
          <p>
            <Trans>You can also ask a member to pay you: the exchange then waits until they accept it.</Trans>
          </p>
        </Topic>

        <Topic title={<Trans>Taking part in events</Trans>}>
          <p>
            <Trans>
              On an <Link href={routes.events()}>event</Link>, say whether you're coming, so that the
              organizer knows who to expect. You can change your mind until the event.
            </Trans>
          </p>
        </Topic>

        <Topic title={<Trans>Finding members</Trans>}>
          <p>
            <Trans>
              The <Link href={routes.members()}>members</Link> page lists everyone in the LETS, with a map of
              who lives nearby. The <Link href={routes.interests()}>interests</Link> show who shares what you
              like.
            </Trans>
          </p>
        </Topic>

        <Topic title={<Trans>Keeping informed</Trans>}>
          <p>
            <Trans>
              The <Link href={routes.information()}>information</Link> page gathers the news of the LETS and
              the members' posts. The useful files, such as the statutes, are in the{' '}
              <Link href={routes.documents()}>documents</Link>.
            </Trans>
          </p>
        </Topic>
      </Card.Root>
    </section>
  );
}

function Topic({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="my-4 stack gap-2 px-4 md:px-6 [&_a]:text-primary [&_a]:underline">
      <h3 className="text-body-strong">{title}</h3>
      {children}
    </div>
  );
}

function GoodToKnowSection() {
  return (
    <section>
      <h2 className="my-2 text-title-3">
        <Trans>Good to know</Trans>
      </h2>

      <Card.Root className="block">
        <Question title={<Trans>How do I get notifications on my phone?</Trans>}>
          <p>
            <Trans>
              In the <Link href={routes.settings()}>settings</Link>, choose “On your devices”, then tap “Allow
              on this device”. Do it on each phone or computer you use.
            </Trans>
          </p>
          <p>
            <Trans>
              On an iPhone, first install the app: in Safari, tap the share button, then “Add to Home Screen”,
              and open the app from there.
            </Trans>
          </p>
        </Question>

        <Question title={<Trans>Who is notified when I post a request or an event?</Trans>}>
          <p>
            <Trans>All the members of the LETS.</Trans>
          </p>
        </Question>

        <Question title={<Trans>Who is notified when I write a comment?</Trans>}>
          <p>
            <Trans>
              The members who took part: the author, those who offered their help or are coming, and those who
              already commented.
            </Trans>
          </p>
          <p>
            <Trans>We prefer comments so that everyone stays in the loop.</Trans>
          </p>
        </Question>

        <Question title={<Trans>Can I reply to a notification email?</Trans>}>
          <p>
            <Trans>
              Yes, but your reply only reaches one person, not the other participants. To keep everyone
              informed, write a comment in the app instead.
            </Trans>
          </p>
        </Question>

        <Question title={<Trans>How do I contact a member privately?</Trans>}>
          <p>
            <Trans>
              Their phone number and email address are on their profile, if they chose to show them.
            </Trans>
          </p>
        </Question>

        <Question title={<Trans>Who can see my phone number and email address?</Trans>}>
          <p>
            <Trans>
              Only the members of the LETS, and only if you allow it on your{' '}
              <Link href={routes.profile()}>profile</Link>.
            </Trans>
          </p>
        </Question>
      </Card.Root>
    </section>
  );
}

function Question({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group not-last:border-b">
      <summary
        className={clsx(
          'row min-h-14 cursor-pointer list-none items-center gap-3 p-4 text-body-strong',
          'focus-visible:focus-ring-inset focus-visible:outline-none [&::-webkit-details-marker]:hidden',
        )}
      >
        <span className="flex-1">{title}</span>
        <Icon name="chevron-down" className="text-muted transition group-open:-scale-y-100" />
      </summary>

      <div className="stack gap-2 px-4 pb-4 [&_a]:text-primary [&_a]:underline">{children}</div>
    </details>
  );
}

function FeedbackSection({ className }: { className?: string }) {
  const { t } = useLingui();
  const { letsName, contactEmail } = useConfig();
  const me = useSession();

  const memberNumber = me.number;
  const version = __APP_VERSION__;
  const userAgent = navigator.userAgent;

  const bugReport = t`What happened?


What did you expect instead?


---
Member #${memberNumber}
Version ${version}
${userAgent}`;

  return (
    <Card.Root id="feedback" role="region" aria-labelledby="feedback-title" className={className}>
      <Card.Header>
        <Card.Title level={2} id="feedback-title">
          <Trans>A problem, an idea?</Trans>
        </Card.Title>
        <Card.Description>
          <Trans>Your feedback helps us improve the application.</Trans>
        </Card.Description>
      </Card.Header>

      <ul className="border-y">
        <FeedbackItem
          icon="bug"
          title={<Trans>Report a bug</Trans>}
          description={<Trans>Something doesn't work as expected</Trans>}
          href={mailto(contactEmail, t`[${letsName}] Bug report`, bugReport)}
        />
        <FeedbackItem
          icon="idea"
          title={<Trans>Suggest an idea</Trans>}
          description={<Trans>An improvement, a clearer wording…</Trans>}
          href={mailto(contactEmail, t`[${letsName}] Suggestion`)}
        />
      </ul>

      <Card.Footer>
        <p className="text-body-sm text-muted">
          <Trans>
            Nothing happens?{' '}
            <Link href="#contact" className="underline">
              Write to us
            </Link>{' '}
            from your usual email.
          </Trans>
        </p>
      </Card.Footer>
    </Card.Root>
  );
}

type FeedbackItemProps = {
  icon: IconName;
  title: React.ReactNode;
  description: React.ReactNode;
  href: string;
};

function FeedbackItem({ icon, title, description, href }: FeedbackItemProps) {
  return (
    <ListItem.Root>
      <Icon name={icon} className="text-muted" />

      <ListItem.Content>
        <ListItem.Title className="text-body-strong">
          <ListItem.Link href={href}>{title}</ListItem.Link>
        </ListItem.Title>
        <ListItem.Description>{description}</ListItem.Description>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem.Root>
  );
}

function mailto(email: string, subject: string, body?: string) {
  const params = new URLSearchParams({ subject, ...(body !== undefined && { body }) });

  // URLSearchParams encodes spaces as "+", which mail apps keep as is.
  return `mailto:${email}?${params.toString().replaceAll('+', '%20')}`;
}
