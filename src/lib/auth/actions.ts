"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authRedirectCookie, getSafeRedirectPath } from "@/lib/auth/redirect";
import { env } from "@/lib/env";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.email();

export async function sendMagicLink(formData: FormData) {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  if (!emailSchema.safeParse(email).success) {
    redirect("/giris?error=invalid_email");
  }

  if (!hasSupabasePublicConfig()) {
    redirect("/giris?error=not_configured");
  }

  const nextValue = formData.get("next");
  const nextPath = getSafeRedirectPath(nextValue, "/");
  const cookieStore = await cookies();
  cookieStore.set(authRedirectCookie, nextPath, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15,
    path: "/",
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  });

  if (error) {
    redirect("/giris?error=send_failed");
  }

  redirect("/giris?sent=1");
}

export async function signOut() {
  if (hasSupabasePublicConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }

  const cookieStore = await cookies();
  cookieStore.delete(authRedirectCookie);
  redirect("/");
}
