import { Email } from '../common/email';
import { MemberName } from '../common/member-name';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  subject: {
    canceled: `{requester} a annulé sa demande "{title}"`,
    fulfilled: `La demande "{title}" de {requester} a été satisfaite`,
  },
  greeting: 'Bonjour {firstName},',
  statusChanged: {
    canceled: {
      html: `<strong>{requester}</strong> a annulé sa demande : <link>{title}</link>`,
      text: '{requester} a annulé sa demande : {title}\nLien de la demande : {link}',
    },
    fulfilled: {
      html: `La demande <link>{title}</link> de <strong>{requester}</strong> a été satisfaite`,
      text: 'La demande {title} de {requester} a été satisfaite\nLien de la demande : {link}',
    },
  },
};

type RequestStatusChangedEmailProps = {
  appBaseUrl: string;
  firstName: string;
  request: {
    id: string;
    title: string;
    status: string;
    requester: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
};

export function subject(props: RequestStatusChangedEmailProps) {
  return translate(props.request.status === 'canceled' ? fr.subject.canceled : fr.subject.fulfilled, {
    requester: MemberName.text(props.request.requester),
    title: props.request.title,
  }) as string;
}

export function html(props: RequestStatusChangedEmailProps) {
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
              props.request.status === 'canceled'
                ? fr.statusChanged.canceled.html
                : fr.statusChanged.fulfilled.html
            }
            values={{
              requester: <MemberName member={props.request.requester} />,
              title: props.request.title,
              link: (children) => <a href={`${props.appBaseUrl}/requests/${props.request.id}`}>{children}</a>,
            }}
          />
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: RequestStatusChangedEmailProps) {
  const messages = fr;

  return [
    translate(messages.greeting, { firstName: props.firstName }),
    translate(
      props.request.status === 'canceled' ? fr.statusChanged.canceled.text : fr.statusChanged.fulfilled.text,
      {
        requester: MemberName.text(props.request.requester),
        title: props.request.title,
        link: `${props.appBaseUrl}/requests/${props.request.id}`,
      },
    ),
  ].join('\n\n');
}
