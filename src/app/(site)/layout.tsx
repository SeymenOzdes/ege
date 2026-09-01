import type { ReactNode } from "react";
import { PublicShell } from "@/components/site/public-shell";

/**
 * No route-segment override here on purpose.
 *
 * The shell used to force `dynamic = "force-dynamic"` because it rendered the reader's
 * account state, which closed the CDN cache on every public page. That state now
 * resolves in the browser, so each page underneath decides its own caching.
 */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <PublicShell>{children}</PublicShell>;
}
