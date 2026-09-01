import type { NextConfig } from "next";

/**
 * Hero images are served straight from the public `news-media` bucket, so `next/image`
 * has to be told that host is allowed — without this it answers 400 for every hero.
 *
 * The pattern is derived from the same environment variable the Supabase clients read,
 * so a project swap needs no config edit. It is deliberately narrow: only the public
 * object path of that one bucket, and no query string. Anything unset simply yields no
 * pattern, which keeps a config-less build working the way `hasSupabasePublicConfig()`
 * does elsewhere.
 */
function supabaseImagePatterns() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return [];

  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: "/storage/v1/object/public/news-media/**",
        search: "",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: supabaseImagePatterns(),
  },
};

export default nextConfig;
