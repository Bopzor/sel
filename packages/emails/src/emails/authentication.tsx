import { Email } from '../common/email';
import { Section } from '../common/section';

type AuthenticationEmailProps = {
  appBaseUrl: string;
  firstName: string;
  authenticationUrl: string;
};

export function subject() {
  return 'Lien de connexion';
}

export function html(props: AuthenticationEmailProps) {
  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject()}>
      <Section>
        <mj-text padding="8px 0">Bonjour {props.firstName},</mj-text>

        <mj-text padding="8px 0">
          Pour vous connecter à l'app du SEL, cliquez sur le lien suivant :{' '}
          <a href={props.authenticationUrl}>{props.authenticationUrl}</a>
        </mj-text>

        <mj-text padding="8px 0" font-size="14px" color="#666">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: AuthenticationEmailProps) {
  return `
Bonjour ${props.firstName},

Pour vous connecter à l'app du SEL, ouvrez le lien suivant depuis un navigateur : ${props.authenticationUrl}

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
  `;
}
