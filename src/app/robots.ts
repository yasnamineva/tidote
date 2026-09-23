import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The client portal, the studio panel and the login screen: reachable
      // if you know the URL, but no reason to be in search results. No
      // trailing slashes — these are prefixes, so they cover both /admin and
      // /admin/anything.
      disallow: ["/admin", "/dashboard", "/login"],
    },
    sitemap: "https://tidoteatelier.com/sitemap.xml",
  };
}
