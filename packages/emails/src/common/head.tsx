type HeadProps = {
  preview: string;
};

export function Head(props: HeadProps) {
  return (
    <mj-head>
      <mj-font name="Inter" href="https://fonts.googleapis.com/css?family=Inter" />

      <mj-attributes>
        <mj-all padding="0" font-family="Inter, sans-serif" font-size="16px" line-height="21px" />
      </mj-attributes>

      <mj-preview>{props.preview}</mj-preview>
    </mj-head>
  );
}
