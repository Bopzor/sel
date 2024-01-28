import { Email } from '../common/email';
import { Section } from '../common/section';

type NotificationEmailProps = {
  appBaseUrl: string;
  firstName: string;
  title: string;
  content: string;
};

export function subject() {
  return 'Lien de connexion';
}

export function html(props: NotificationEmailProps) {
  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject()}>
      <Section>
        <mj-text padding="8px 0">Bonjour {props.firstName},</mj-text>
        <mj-text padding="8px 0">{props.title}</mj-text>
        <mj-text padding="8px 0">{props.content}</mj-text>
        <mj-text padding="8px 0">À bientôt !</mj-text>
      </Section>
    </Email>
  );
}

export function text(props: NotificationEmailProps) {
  return `
Bonjour ${props.firstName},

${props.title}

${props.content}

À bientôt !
  `;
}
