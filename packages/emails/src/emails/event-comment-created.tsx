import { Email } from '../common/email';
import { MemberName } from '../common/member-name';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  greeting: 'Bonjour {firstName},',
  commentCreated: {
    isOrganizer: {
      html: '<strong>{commentAuthor}</strong> a écrit un commentaire sur son événement :',
      text: '{commentAuthor} a écrit un commentaire sur son événement :',
    },
    isNotOrganizer: {
      html: "<strong>{commentAuthor}</strong> a écrit un commentaire en réponse à l'événement de <strong>{organizer}</strong> :",
      text: "{commentAuthor} a écrit un commentaire en réponse à l'événement de {organizer} :",
    },
  },
  eventConcerned: {
    html: 'Événement concerné : <link>{title}</link>',
    text: 'Événement concerné : {title}\nLien : {link}',
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
  };
  comment: {
    id: string;
    message: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
};

export function subject(props: EventCommentCreatedEmailProps) {
  return `Commentaire de ${MemberName.text(props.comment.author)} sur l\'événement "${props.event.title}"`;
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
            message={
              props.comment.author.id === props.event.organizer.id
                ? messages.commentCreated.isOrganizer.html
                : messages.commentCreated.isNotOrganizer.html
            }
            values={{
              commentAuthor: <MemberName member={props.comment.author} />,
              organizer: <MemberName member={props.event.organizer} />,
            }}
          />
        </mj-text>
      </Section>

      <mj-section padding="16px">
        <mj-column padding="16px" background-color="#F6F6F6" border-radius="8px">
          <mj-text font-style="italic">{props.comment.message}</mj-text>
        </mj-column>
      </mj-section>

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

export function text(props: EventCommentCreatedEmailProps) {
  const messages = fr;

  return [
    translate(messages.greeting, { firstName: props.firstName }),
    translate(
      props.comment.author.id === props.event.organizer.id
        ? messages.commentCreated.isOrganizer.text
        : messages.commentCreated.isNotOrganizer.text,
      { commentAuthor: MemberName.text(props.comment.author) },
    ),
    '-',
    translate(messages.eventConcerned.text, {
      title: props.event.title,
      link: `${props.appBaseUrl}/events/${props.event.id}`,
    }),
  ].join('\n\n');
}
