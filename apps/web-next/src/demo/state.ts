import seedJson from './seed.json?raw';
import { demoStorage } from './storage';

import type { demo } from './demo';

type Seed = demo.State & {
  /** The day the seed was written: its dates are moved by the time elapsed since, for the data to stay current. */
  referenceDate: string;
};

type StoredState = {
  seed: string;
  state: demo.State;
};

// The state is created again when the seed changes.
export async function loadDemoState(): Promise<demo.State> {
  const stored = await demoStorage.getState<StoredState>();

  if (stored?.seed === seedJson) {
    return stored.state;
  }

  await demoStorage.clear();

  const { referenceDate, ...state } = JSON.parse(seedJson) as Seed;

  // Whole days keep the times of the seed, and never move a past date to the future.
  const day = 24 * 60 * 60 * 1000;
  const offset = Math.floor((Date.now() - new Date(referenceDate).getTime()) / day) * day;

  return shiftDates(state, offset) as demo.State;
}

// The member the demo starts with.
export function getDemoSignInEmail() {
  const { members, sessionMemberId } = JSON.parse(seedJson) as Seed;

  return members.find(({ id }) => id === sessionMemberId)?.email;
}

export async function saveDemoState(state: demo.State) {
  await demoStorage.setState({ seed: seedJson, state } satisfies StoredState);
}

const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function shiftDates(value: unknown, offset: number): unknown {
  if (typeof value === 'string' && isoDate.test(value)) {
    return new Date(new Date(value).getTime() + offset).toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => shiftDates(item, offset));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shiftDates(item, offset)]));
  }

  return value;
}
