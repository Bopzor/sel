import { Email } from '../common/email';
import { MemberName } from '../common/member-name';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  greeting: 'Bonjour {firstName},',
  requestCreated: {
    html: '<strong>{requester}</strong> a publié une nouvelle demande : <link>{title}</link>',
    text: '{requester} a publié une nouvelle demande : {title}\nLien : {link}',
  },
};

type RequestCommentCreatedEmailProps = {
  appBaseUrl: string;
  firstName: string;
  request: {
    id: string;
    title: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
    };
    body: string;
  };
};

export function subject(props: RequestCommentCreatedEmailProps) {
  return `Demande de ${MemberName.text(props.request.author)} : ${props.request.title}`;
}

export function html(props: RequestCommentCreatedEmailProps) {
  const messages = fr;

  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject(props)}>
      <Section>
        <mj-text padding="8px 0">
          <Translate message={messages.greeting} values={{ firstName: props.firstName }} />
        </mj-text>

        <mj-text padding="8px 0">
          <Translate
            message={messages.requestCreated.html}
            values={{
              requester: <MemberName member={props.request.author} />,
              title: props.request.title,
              link: (children) => <a href={`${props.appBaseUrl}/requests/${props.request.id}`}>{children}</a>,
            }}
          />
        </mj-text>
      </Section>

      <mj-section padding="16px">
        <mj-column padding="16px" background-color="#F6F6F6" border-radius="8px">
          <mj-text font-style="italic">{props.request.body}</mj-text>
        </mj-column>
      </mj-section>
    </Email>
  );
}

export function text(props: RequestCommentCreatedEmailProps) {
  const messages = fr;

  return [
    translate(messages.greeting, { firstName: props.firstName }),
    translate(messages.requestCreated.text, {
      requester: MemberName.text(props.request.author),
      title: props.request.title,
      link: `${props.appBaseUrl}/requests/${props.request.id}`,
    }),
    props.request.body,
  ].join('\n\n');
}
