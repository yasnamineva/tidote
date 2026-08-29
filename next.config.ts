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

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
