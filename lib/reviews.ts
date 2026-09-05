import { getDb } from "./db";

export type Review = {
  id: number;
  product_id: number;
  name: string;
  rating: number;
  body: string;
  created_at: string;
};

export type RatingSummary = { count: number; average: number };

/** ملخص تقييمات منتج — المعتمدة فقط */
export function ratingFor(productId: number): RatingSummary {
  const r = getDb()
    .prepare(
      "SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews WHERE product_id = ? AND approved = 1"
    )
    .get(productId) as { count: number; average: number };
  return { count: r.count, average: Math.round(r.average * 10) / 10 };
}

export function approvedReviews(productId: number, limit = 20): Review[] {
  return getDb()
    .prepare(
      `SELECT id, product_id, name, rating, body, created_at FROM reviews
       WHERE product_id = ? AND approved = 1 ORDER BY id DESC LIMIT ?`
    )
    .all(productId, limit) as Review[];
}

/**
 * هل يحق لصاحب هذا الرمز تقييم هذا المنتج؟
 *
 * التقييم لمن اشترى فقط: نتحقق أن الرمز يخص طلبًا يحوي هذا المنتج.
 * هذا يمنع التقييمات الوهمية من أصلها بدل مطاردتها بعد نشرها، ويجعل
 * كل نجمة على الصفحة نجمة من مشترٍ حقيقي.
 */
export function mayReview(
  orderCode: string,
  productId: number
): { ok: true } | { ok: false; error: string } {
  const order = getDb()
    .prepare("SELECT items_json, status FROM orders WHERE code = ?")
    .get(orderCode.trim()) as { items_json: string; status: string } | undefined;

  if (!order) return { ok: false, error: "رمز الطلب غير صحيح" };
  if (order.status === "cancelled")
    return { ok: false, error: "هذا الطلب ملغي" };

  let has = false;
  try {
    const items = JSON.parse(order.items_json) as { id: number }[];
    has = items.some((i) => Number(i.id) === productId);
  } catch {
    has = false;
  }
  if (!has) return { ok: false, error: "هذا المنتج ليس ضمن الطلب" };

  const already = getDb()
    .prepare("SELECT id FROM reviews WHERE order_code = ? AND product_id = ?")
    .get(orderCode.trim(), productId);
  if (already) return { ok: false, error: "قيّمت هذا المنتج من هذا الطلب سابقًا" };

  return { ok: true };
}
