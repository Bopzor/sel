import { JSX, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';

export function Collapse(props: { open: boolean; children: JSX.Element }) {
  const [size, resizeObserver] = createResizeObserver();

  return (
    <div
      // eslint-disable-next-line tailwindcss/no-arbitrary-value
      class="overflow-hidden transition-[max-height] will-change-[max-height]"
      style={{ 'max-height': props.open ? `${size.height ?? 0}px` : 0 }}
    >
      <div ref={(ref) => resizeObserver.observe(ref)}>{props.children}</div>
    </div>
  );
}

function createResizeObserver() {
  const [size, setSize] = createStore<{ width?: number; height?: number }>({});

  const resizeObserver = new ResizeObserver((entries) => {
    setSize({
      width: entries[0]?.borderBoxSize[0].inlineSize,
      height: entries[0]?.borderBoxSize[0].blockSize,
    });
  });

  onCleanup(() => {
    resizeObserver.disconnect();
  });

  return [size, resizeObserver] as const;
}
