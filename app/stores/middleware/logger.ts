import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;

    const val1 = obj1[key];
    const val2 = obj2[key];

    if (typeof val1 === 'function' && typeof val2 === 'function') {
      continue;
    }

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!deepEqual(val1, val2)) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
}

function getStateDiff(prevState: any, nextState: any): Record<string, { from: any; to: any }> {
  const diff: Record<string, { from: any; to: any }> = {};

  const allKeys = new Set([...Object.keys(prevState), ...Object.keys(nextState)]);

  for (const key of allKeys) {
    const prevValue = prevState[key];
    const nextValue = nextState[key];

    if (typeof prevValue === 'function' || typeof nextValue === 'function') {
      continue;
    }

    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      if (!deepEqual(prevValue, nextValue)) {
        diff[key] = { from: prevValue, to: nextValue };
      }
    } else if (prevValue !== nextValue) {
      diff[key] = { from: prevValue, to: nextValue };
    }
  }

  return diff;
}

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  // Only enable logger in development mode
  if (!import.meta.env.DEV) {
    return f(set, get, store);
  }

  const loggedSet: typeof set = (nextStateOrUpdater, replace) => {
    const prevState = get();

    // Type assertion to handle the overload complexity
    (set as any)(nextStateOrUpdater, replace);

    const nextState = get();

    // Only log if state actually changed (deep comparison)
    const diff = getStateDiff(prevState, nextState);

    console.group(`🔄 ${name || 'Store'} Update`);
    console.log('Changed properties:', diff);
    console.groupEnd();
  };

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as unknown as Logger;
