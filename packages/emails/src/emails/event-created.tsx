import { Email } from '../common/email';
import { MemberName } from '../common/member-name';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  greeting: 'Bonjour {firstName},',
  eventCreated: {
    html: '<strong>{organizer}</strong> a créé un nouvel événement : <link>{title}</link>',
    text: '{organizer} a créé un nouvel événement : {title}\nLien : {link}',
  },
};

type EventCommentCreatedEmailProps = {
  appBaseUrl: string;
  firstName: string;
  event: {
    id: string;
    title: string;
    organizer: {
      id: string;
      firstName: string;
      lastName: string;
    };
    message: string;
  };
};

export function subject(props: EventCommentCreatedEmailProps) {
  return `Événement : ${props.event.title}`;
}

export function html(props: EventCommentCreatedEmailProps) {
  const messages = fr;

  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject(props)}>
      <Section>
        <mj-text padding="8px 0">
          <Translate message={messages.greeting} values={{ firstName: props.firstName }} />
        </mj-text>

        <mj-text padding="8px 0">
          <Translate
            message={messages.eventCreated.html}
            values={{
              organizer: <MemberName member={props.event.organizer} />,
              title: props.event.title,
              link: (children) => <a href={`${props.appBaseUrl}/events/${props.event.id}`}>{children}</a>,
            }}
          />
        </mj-text>
      </Section>

      <mj-section padding="16px">
        <mj-column padding="16px" background-color="#F6F6F6" border-radius="8px">
          <mj-text font-style="italic">{props.event.message}</mj-text>
        </mj-column>
      </mj-section>
    </Email>
  );
}

export function text(props: EventCommentCreatedEmailProps) {
  const messages = fr;

  return [
    translate(messages.greeting, { firstName: props.firstName }),
    translate(messages.eventCreated.text, {
      organizer: MemberName.text(props.event.organizer),
      title: props.event.title,
      link: `${props.appBaseUrl}/events/${props.event.id}`,
    }),
    props.event.message,
  ].join('\n\n');
}
