import type { MetadataRoute } from "next";

const SITE_URL = "https://tidoteatelier.com";

// Only the public brand pages. Everything under the portal is disallowed in
// robots.ts and deliberately absent here.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/casual`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sports`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // The rail turns over faster than the lookbooks do.
    {
      url: `${SITE_URL}/in-stock`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/worn-by`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
