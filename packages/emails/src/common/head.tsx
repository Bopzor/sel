import { JSX } from 'solid-js';

type HeadProps = {
  preview: JSX.Element;
};

export function Head(props: HeadProps) {
  return (
    <mj-head>
      <mj-font name="Inter" href="https://fonts.googleapis.com/css?family=Inter" />

      <mj-attributes>
        <mj-all padding="0" font-family="Inter, sans-serif" font-size="16px" line-height="21px" />
      </mj-attributes>

      <mj-style inline="inline">
        {`.strong {
            font-weight: 600;
            color: #333;
          }`}
      </mj-style>

      <mj-preview>{props.preview}</mj-preview>
    </mj-head>
  );
}
