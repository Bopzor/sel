import { createSignal, onMount, onCleanup } from 'solid-js';

export function createMediaQuery(query: string) {
  const match = window.matchMedia(query);
  const [matches, setMatches] = createSignal(match.matches);

  const onChange = (event: MediaQueryListEvent) => {
    setMatches(event.matches);
  };

  onMount(() => match.addEventListener('change', onChange));
  onCleanup(() => match.removeEventListener('change', onChange));

  return matches;
}
