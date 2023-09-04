import { createMemo, createSignal, onCleanup } from 'solid-js';

import { store } from './store';
import { AppSelector } from './types';

export function selector<ReturnType>(selector: AppSelector<[], ReturnType>) {
  const [state, setState] = createSignal(store.getState());
  const unsubscribe = store.subscribe(() => setState(store.getState()));

  onCleanup(() => unsubscribe());

  const result = createMemo(() => selector(state()));

  return result;
}
