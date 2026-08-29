import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The client portal, studio panel, and login screen are a working
      // prototype backed by browser storage — reachable if you know the URL,
      // but kept out of search results. No trailing slashes: these are
      // prefixes, so they cover both /admin and /admin/anything.
      disallow: ["/admin", "/dashboard", "/login"],
    },
    sitemap: "https://tidoteatelier.com/sitemap.xml",
  };
}
