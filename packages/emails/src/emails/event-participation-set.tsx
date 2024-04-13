import { Email } from '../common/email';
import { MemberName } from '../common/member-name';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  greeting: 'Bonjour {firstName},',
  participationAdded: {
    html: '<strong>{participant}</strong> participe à votre événement.',
    text: '{participant} participe à votre événement.',
  },
  participationRemoved: {
    html: '<strong>{participant}</strong> net participe plus à votre événement.',
    text: '{participant} ne participe plus à votre événement.',
  },
  eventConcerned: {
    html: 'Événement concerné : <link>{title}</link>',
    text: 'Événement concerné : {title}\nLien : {link}',
  },
};

type EventParticipationSetEmailProps = {
  appBaseUrl: string;
  firstName: string;
  event: {
    id: string;
    title: string;
    organizer: {
      id: string;
    };
  };
  participant: {
    id: string;
    firstName: string;
    lastName: string;
  };
  participation: 'yes' | 'no' | null;
};

export function subject(props: EventParticipationSetEmailProps) {
  return `Participation de ${MemberName.text(props.participant)} à votre événement "${props.event.title}"`;
}

export function html(props: EventParticipationSetEmailProps) {
  const messages = fr;

  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject(props)}>
      <Section>
        <mj-text padding="8px 0">
          <Translate message={messages.greeting} values={{ firstName: props.firstName }} />
        </mj-text>

        <mj-text padding="8px 0">
          <Translate
            message={
              props.participation === 'yes'
                ? messages.participationAdded.html
                : messages.participationRemoved.html
            }
            values={{ participant: <MemberName member={props.participant} /> }}
          />
        </mj-text>
      </Section>

      <Section>
        <mj-text>
          <Translate
            message={messages.eventConcerned.html}
            values={{
              link: (children) => <a href={`${props.appBaseUrl}/events/${props.event.id}`}>{children}</a>,
              title: props.event.title,
            }}
          />
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: EventParticipationSetEmailProps) {
  const messages = fr;

  return [
    translate(messages.greeting, { firstName: props.firstName }),
    translate(
      props.participation === 'yes' ? messages.participationAdded.text : messages.participationRemoved.text,
      { participant: MemberName.text(props.participant) },
    ),
    '-',
    translate(messages.eventConcerned.text, {
      title: props.event.title,
      link: `${props.appBaseUrl}/events/${props.event.id}`,
    }),
  ].join('\n\n');
}
