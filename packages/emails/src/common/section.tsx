import { JSX } from 'solid-js';

type SectionProps = {
  padding?: string;
  children: JSX.Element;
};

export function Section(props: SectionProps) {
  return (
    <mj-section padding={props.padding ?? '0 16px'}>
      <mj-column>{props.children}</mj-column>
    </mj-section>
  );
}
