import { getDb } from "./db";

/**
 * كل بوست مستورد من إنستقرام يقابله صف في `products`.
 * جدول `instagram_posts` يحفظ الأصل (الكابشن والصورة و source_key)
 * حتى لا يتكرر الاستيراد، ويربط البوست بالمنتج الذي أنشأه.
 */
export type ImportedProduct = {
  post_id: number;
  caption: string;
  image: string;
  extra_images: string;
  taken_at: string;
  product_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  active: number;
  colors: string;
  images: string;
  color_mode: string;
};

/** المنتجات المستوردة من إنستقرام — الأحدث نشرًا أولًا */
export function getImportedProducts(): ImportedProduct[] {
  return getDb()
    .prepare(
      `SELECT ip.id AS post_id, ip.caption, ip.image, ip.extra_images, ip.taken_at,
              p.id AS product_id, p.name, p.description, p.price, p.category, p.stock, p.active, p.colors, p.images, p.color_mode
       FROM instagram_posts ip
       JOIN products p ON p.id = ip.product_id
       ORDER BY ip.taken_at DESC, ip.id DESC`
    )
    .all() as ImportedProduct[];
}

/** بقية صور البوست متعدد الصور (carousel) */
export function extraImages(row: { extra_images: string }): string[] {
  try {
    const parsed = JSON.parse(row.extra_images);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
