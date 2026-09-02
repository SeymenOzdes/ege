"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hydration-safe "rendered on the client" flag without setState in an effect.
 *
 * For components that need to look up a DOM node (e.g. a portal target) that
 * only exists once hydrated.
 */
export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
