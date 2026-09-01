import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Build-time guard with no test-time meaning; see the stub for why.
      "server-only": fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      // Hero URLs are derived from this host, so the media and preview expectations
      // need it pinned. The publishable key stays unset, which keeps
      // `hasSupabasePublicConfig()` false and every query adapter on its offline path.
      NEXT_PUBLIC_SUPABASE_URL: "https://proje.supabase.co",
    },
  },
});
