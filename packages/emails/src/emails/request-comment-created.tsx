import { Email } from '../common/email';
import { MemberName } from '../common/member-name';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  greeting: 'Bonjour {firstName},',
  commentCreated: {
    isRequester: {
      html: '<strong>{commentAuthor}</strong> a écrit un commentaire sur sa demande :',
      text: '{commentAuthor} a écrit un commentaire sur sa demande :',
    },
    isNotRequester: {
      html: '<strong>{commentAuthor}</strong> a écrit un commentaire en réponse à la demande de <strong>{requester}</strong> :',
      text: '{commentAuthor} a écrit un commentaire en réponse à la demande de {requester} :',
    },
  },
  requestConcerned: {
    html: 'Demande concernée : <link>{title}</link>',
    text: 'Demande concernée : {title}\nLien : {link}',
  },
};

type RequestCommentCreatedEmailProps = {
  appBaseUrl: string;
  firstName: string;
  request: {
    id: string;
    title: string;
    requester: {
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

export function subject(props: RequestCommentCreatedEmailProps) {
  return `Commentaire de ${MemberName.text(props.comment.author)} sur la demande "${props.request.title}"`;
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
            message={
              props.comment.author.id === props.request.requester.id
                ? messages.commentCreated.isRequester.html
                : messages.commentCreated.isNotRequester.html
            }
            values={{
              commentAuthor: <MemberName member={props.comment.author} />,
              requester: <MemberName member={props.request.requester} />,
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
            message={messages.requestConcerned.html}
            values={{
              link: (children) => <a href={`${props.appBaseUrl}/requests/${props.request.id}`}>{children}</a>,
              title: props.request.title,
            }}
          />
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: RequestCommentCreatedEmailProps) {
  const messages = fr;

  return [
    translate(messages.greeting, { firstName: props.firstName }),
    translate(
      props.comment.author.id === props.request.requester.id
        ? messages.commentCreated.isRequester.text
        : messages.commentCreated.isNotRequester.text,
      {
        commentAuthor: MemberName.text(props.comment.author),
        requester: MemberName.text(props.request.requester),
      },
    ),
    '-',
    translate(messages.requestConcerned.text, {
      title: props.request.title,
      link: `${props.appBaseUrl}/requests/${props.request.id}`,
    }),
  ].join('\n\n');
}
