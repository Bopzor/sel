import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(externalValue = '') {
    const onDebounced = vi.fn<(value: string) => void>();

    const hook = renderHook(
      ({ externalValue, onDebounced }) => useDebouncedValue(externalValue, onDebounced),
      { initialProps: { externalValue, onDebounced } },
    );

    const value = () => hook.result.current[0];
    const change = (value: string) => act(() => hook.result.current[1](value));
    const clear = () => act(() => hook.result.current[2]());

    return { hook, onDebounced, value, change, clear };
  }

  it('starts with the external value', () => {
    const { value } = setup('cat');

    expect(value()).toBe('cat');
  });

  it('calls back once with the last value, after the delay', () => {
    const { onDebounced, value, change } = setup();

    change('c');
    change('ca');
    change('cat');

    expect(value()).toBe('cat');

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(onDebounced).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onDebounced).toHaveBeenCalledExactlyOnceWith('cat');
  });

  it('calls the latest callback', () => {
    const { hook, onDebounced, change } = setup();
    const latest = vi.fn<(value: string) => void>();

    change('cat');
    hook.rerender({ externalValue: '', onDebounced: latest });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDebounced).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledExactlyOnceWith('cat');
  });

  it('follows a change of the external value', () => {
    const { hook, onDebounced, value } = setup('cat');

    hook.rerender({ externalValue: '', onDebounced });

    expect(value()).toBe('');
  });

  it('drops a pending change when the external value changes', () => {
    const { hook, onDebounced, value, change } = setup('cat');

    change('dog');
    hook.rerender({ externalValue: '', onDebounced });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(value()).toBe('');
    expect(onDebounced).not.toHaveBeenCalled();
  });

  it('clears the value and drops a pending change', () => {
    const { onDebounced, value, change, clear } = setup();

    change('cat');
    clear();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(value()).toBe('');
    expect(onDebounced).not.toHaveBeenCalled();
  });

  it('drops a pending change when unmounted', () => {
    const { hook, onDebounced, change } = setup();

    change('cat');
    hook.unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onDebounced).not.toHaveBeenCalled();
  });
});
