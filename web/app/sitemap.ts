import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{const base="https://alpha-builders-web.cskadys.workers.dev";return [{url:base,changeFrequency:"weekly",priority:1},{url:`${base}/participar`,changeFrequency:"weekly",priority:.8},{url:`${base}/operations`,changeFrequency:"daily",priority:.6}]}
