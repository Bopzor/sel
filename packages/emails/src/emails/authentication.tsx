import { Email } from '../common/email';
import { Section } from '../common/section';
import { Translate, translate } from '../intl/intl';

const fr = {
  greeting: 'Bonjour {firstName},',
  authenticate: {
    html: "Pour vous connecter à l'app du SEL, cliquez sur le lien suivant : <link>{authenticationUrl}</link>",
    text: "Pour vous connecter à l'app du SEL, ouvrez le lien suivant depuis un navigateur : {authenticationUrl}",
  },
  ignore: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
};

type AuthenticationEmailProps = {
  appBaseUrl: string;
  firstName: string;
  authenticationUrl: string;
};

export function subject() {
  return 'Lien de connexion';
}

export function html(props: AuthenticationEmailProps) {
  const messages = fr;

  return (
    <Email appBaseUrl={props.appBaseUrl} preview={subject()}>
      <Section>
        <mj-text padding="8px 0">
          <Translate message={messages.greeting} values={{ firstName: props.firstName }} />
        </mj-text>

        <mj-text padding="8px 0">
          <Translate
            message={messages.authenticate.html}
            values={{
              link: (children) => <a href={props.authenticationUrl}>{children}</a>,
              authenticationUrl: props.authenticationUrl,
            }}
          />
        </mj-text>

        <mj-text padding="8px 0" font-size="14px" color="#666">
          <Translate message={messages.ignore} />
        </mj-text>
      </Section>
    </Email>
  );
}

export function text(props: AuthenticationEmailProps) {
  const messages = fr;

  return [
    translate(messages.greeting, { firstName: props.firstName }),
    translate(messages.authenticate.text, { authenticationUrl: props.authenticationUrl }),
    translate(messages.ignore),
  ].join('\n\n');
}
