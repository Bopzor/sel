import { Section } from './section';

type HeaderProps = {
  appBaseUrl: string;
};

export function Header(props: HeaderProps) {
  return (
    <>
      <mj-section background-color="#005f7e" padding="16px">
        <mj-column width="15%" vertical-align="middle">
          <mj-image
            src={`${props.appBaseUrl}/logo.png`}
            href={props.appBaseUrl}
            border-radius="8px"
            width="64px"
            height="64px"
          />
        </mj-column>

        <mj-column width="85%" padding-left="16px" vertical-align="middle">
          <mj-text font-size="32px" line-height="32px" font-weight="bold" color="#ffffff">
            <a href={props.appBaseUrl} style="text-decoration: none; color: inherit">
              SEL'ons-nous
            </a>
          </mj-text>
          <mj-text font-size="14px" color="#ffffff">
            Système d'Échange Local de Cavaillon et ses environs
          </mj-text>
        </mj-column>
      </mj-section>

      <Section>
        <mj-spacer height="30px" />
      </Section>
    </>
  );
}
