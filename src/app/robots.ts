import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The client portal, the studio panel, the login screen and the
      // one-time studio setup page: reachable if you know the URL, but no
      // reason to be in search results. No trailing slashes — these are
      // prefixes, so they cover both /admin and /admin/anything.
      disallow: ["/admin", "/dashboard", "/login", "/studio-setup"],
    },
    sitemap: "https://tidoteatelier.com/sitemap.xml",
  };
}
