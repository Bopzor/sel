import { Email } from '../common/email';
import { Section } from '../common/section';

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
  return `Commentaire de ${props.comment.author.firstName} ${props.comment.author.lastName} sur la demande "${props.request.title}"`;
}

export function html(props: RequestCommentCreatedEmailProps) {
  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject(props)}>
      <Section>
        <mj-text padding="8px 0">Bonjour {props.firstName},</mj-text>
        <mj-text padding="8px 0">
          <span class="strong">
            {props.comment.author.firstName} {props.comment.author.lastName}
          </span>{' '}
          a écrit un commentaire en réponse à la demande de{' '}
          <span class="strong">
            {props.request.author.firstName} {props.request.author.lastName}
          </span>{' '}
          :
        </mj-text>
      </Section>

      <mj-section padding="16px">
        <mj-column padding="16px" background-color="#FAFAFA" border-radius="8px">
          <mj-text font-style="italic">{props.comment.message}</mj-text>
        </mj-column>
      </mj-section>

      <Section>
        <mj-text>
          Demande concernée :{' '}
          <a href={`${props.appBaseUrl}/requests/${props.request.id}`}>{props.request.title}</a>
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: RequestCommentCreatedEmailProps) {
  return `
Bonjour ${props.firstName},

${props.comment.author.firstName} ${props.comment.author.lastName} a écrit un commentaire en réponse à la demande de ${props.request.author.firstName} ${props.request.author.lastName} :

${props.comment.message}

-

Demande concernée : ${props.request.title}
Lien : ${props.appBaseUrl}/requests/${props.request.id}
  `;
}
