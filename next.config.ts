import type { NextConfig } from "next";

// Applied to every route. Vercel already sends Strict-Transport-Security, so
// these are the ones it leaves to the app. No Content-Security-Policy yet: the
// pre-hydration language snippet in the root layout is inline, so a policy
// worth having would need a nonce, and a half-open CSP buys nothing.
const securityHeaders = [
  // Stop browsers from second-guessing declared MIME types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking: nothing here is meant to be embedded elsewhere.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the origin to other sites, the full URL only to ourselves — keeps
  // client portal paths out of third-party referer logs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site asks for none of these, so deny them outright.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

/**
 * Rail photos live in a public Supabase bucket, and letting the browser fetch
 * them straight from there means Supabase serves the same file once per
 * visitor — which is what would exhaust the free plan's 5 GB of monthly egress
 * long before anything on Vercel got expensive. Naming the host here lets
 * next/image pull each photo once and serve it from Vercel's CDN thereafter.
 *
 * Only the public bucket. A client's own photos are private and reached through
 * signed URLs; putting those through a shared image cache would be wrong.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/stock-photos/**",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
