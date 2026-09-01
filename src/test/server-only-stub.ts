/**
 * `server-only` is a bundler guard: it exists so a Client Component that imports a
 * server module fails the build. Vitest has no such boundary to enforce and cannot
 * resolve the package, so `vitest.config.mts` aliases it here to let tests import
 * the pure helpers that live alongside server-only data adapters.
 */
export {};
