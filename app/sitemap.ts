import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/custom`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/track`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/returns`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // صفحات المنتجات المعروضة فقط — المخفية لا تُؤرشف
  const products = getDb()
    .prepare("SELECT id, created_at FROM products WHERE active = 1")
    .all() as { id: number; created_at: string }[];

  return [
    ...staticPages.map((p) => ({ ...p, lastModified: new Date() })),
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
