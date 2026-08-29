const SITE_URL = "https://tidoteatelier.com";

/**
 * Schema.org description of the atelier, emitted as JSON-LD from the root
 * layout. ClothingStore is a LocalBusiness subtype, which is what lets Google
 * treat this as a real place rather than just a website.
 *
 * Deliberately omitted: telephone, priceRange, opening hours, and geo
 * coordinates. Structured data is a public claim about the business, so
 * anything not confirmed by the owner is left out rather than guessed —
 * wrong hours or a wrong pin are worse than none.
 */
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ClothingStore",
      "@id": `${SITE_URL}/#atelier`,
      name: "Tidote Atelier",
      url: SITE_URL,
      description:
        "Made-to-measure streetstyle from a Sofia atelier — casual and sports pieces cut to your own measurements.",
      logo: `${SITE_URL}/icon.png`,
      image: `${SITE_URL}/opengraph-image`,
      email: "support@tidoteatelier.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "ul. Elin Vruh 16",
        addressLocality: "Sofia",
        addressCountry: "BG",
      },
      areaServed: { "@type": "City", name: "Sofia" },
      availableLanguage: ["en", "bg"],
      sameAs: ["https://www.instagram.com/tidote.atelier/"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Made-to-measure",
        itemListElement: [
          {
            "@type": "OfferCatalog",
            name: "Casual",
            url: `${SITE_URL}/casual`,
          },
          {
            "@type": "OfferCatalog",
            name: "Sports",
            url: `${SITE_URL}/sports`,
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Tidote Atelier",
      publisher: { "@id": `${SITE_URL}/#atelier` },
      inLanguage: ["en", "bg"],
    },
  ],
};

/**
 * `<` is escaped so a value can never terminate the surrounding <script> tag.
 * Everything here is authored rather than user-supplied, but the cost is one
 * replace and the failure mode is script injection.
 */
export function structuredDataJson(): string {
  return JSON.stringify(structuredData).replace(/</g, "\\u003c");
}
