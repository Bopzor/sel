// https://github.com/solidjs/solid/discussions/829
export function deepTrack(store: unknown) {
  if (typeof store !== 'object' || store === null) {
    return;
  }

  for (const k in store) {
    deepTrack((store as Record<string, unknown>)[k]);
  }
}
