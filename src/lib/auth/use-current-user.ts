"use client";

import { useEffect, useState } from "react";
import { getClaimString } from "@/lib/auth/roles";
import { toCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export type SessionState = {
  /** False until the first claims check settles; the header stays anonymous meanwhile. */
  resolved: boolean;
  user?: CurrentUser;
};

/**
 * The signed-in reader, resolved in the browser.
 *
 * The public shell used to read this on the server, which forced every page under
 * `(site)` to render per request and closed the CDN cache on a news site's busiest
 * pages. Resolving it here lets those page bodies be cached; the cost is that the
 * account chip settles a beat after the rest of the header, which is why the anonymous
 * state renders first rather than a spinner.
 */
export function useCurrentUser(): SessionState {
  // Supabase yapılandırılmamışsa çözülecek bir oturum da yok: durum daha ilk
  // render'da yerine oturur, efekt hiç iş yapmaz.
  const [state, setState] = useState<SessionState>(() => ({
    resolved: !hasSupabasePublicConfig(),
  }));

  useEffect(() => {
    if (!hasSupabasePublicConfig()) return;

    const supabase = createClient();
    let active = true;

    async function resolve() {
      const { data, error } = await supabase.auth.getClaims();
      if (!active) return;

      if (error || !data?.claims) {
        setState({ resolved: true });
        return;
      }

      const { claims } = data;
      const userId = getClaimString(claims, "sub");
      const { data: profile } = userId
        ? await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle()
        : { data: null };

      if (!active) return;
      setState({ resolved: true, user: toCurrentUser(claims, profile?.display_name) });
    }

    void resolve();

    // Sign-in lands on /auth/confirm and sign-out runs as a server action, so without
    // this the header would keep showing whatever it resolved on first paint.
    const { data } = supabase.auth.onAuthStateChange(() => {
      // supabase-js warns against awaiting its own calls inside this callback;
      // deferring to a macrotask sidesteps the documented deadlock.
      setTimeout(() => void resolve(), 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
