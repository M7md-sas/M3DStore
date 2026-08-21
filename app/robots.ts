import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // صفحات خاصة أو لا معنى لأرشفتها
      disallow: ["/admin", "/api/", "/checkout", "/cart", "/pay/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
