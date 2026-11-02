import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import type { NavigateFunction, To } from 'react-router-dom';

let active = false;
const listeners = new Set<() => void>();

const setActive = (value: boolean) => {
  active = value;
  listeners.forEach((listener) => listener());
};

export const useViewTransitionActive = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => active,
    () => false,
  );

/**
 * Navigate with the native View Transition API when the browser supports it.
 * `flushSync` makes React commit the new route inside the snapshot callback.
 * Falls back to a normal navigation elsewhere.
 */
export function navigateWithViewTransition(navigate: NavigateFunction, to: To) {
  if (
    !document.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    navigate(to);
    return;
  }

  const root = document.documentElement;
  root.classList.add('vt-active');
  flushSync(() => setActive(true));
  const cleanup = () => {
    root.classList.remove('vt-active');
    setActive(false);
  };
  const transition = document.startViewTransition(() => {
    flushSync(() => navigate(to));
  });
  transition.finished.then(cleanup, cleanup);
}
