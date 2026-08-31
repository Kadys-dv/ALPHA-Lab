import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://alpha-builders-web.cskadys.workers.dev";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
