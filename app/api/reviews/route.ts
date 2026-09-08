import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { mayReview, approvedReviews, ratingFor } from "@/lib/reviews";
import { allow, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("product"));
  if (!id) return NextResponse.json({ error: "معرّف مفقود" }, { status: 400 });
  return NextResponse.json({
    summary: ratingFor(id),
    reviews: approvedReviews(id),
  });
}

/**
 * تقييم جديد — من مشترٍ فقط، ولا يُنشر قبل موافقة صاحب المتجر.
 * الاثنان معًا: التحقق من الشراء يمنع الوهمي، والمراجعة تمنع المسيء.
 */
export async function POST(request: Request) {
  if (!allow(`review:${clientIp(request.headers)}`, 5, 60 * 1000))
    return NextResponse.json({ error: "محاولات كثيرة — انتظر دقيقة" }, { status: 429 });

  const body = await request.json().catch(() => null);
  const productId = Number(body?.product_id);
  const rating = Math.round(Number(body?.rating));
  const code = String(body?.order_code ?? "").trim().toUpperCase();

  if (!productId) return NextResponse.json({ error: "معرّف المنتج مفقود" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: "اختر تقييمًا من 1 إلى 5" }, { status: 400 });

  const allowed = mayReview(code, productId);
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: 403 });

  getDb()
    .prepare(
      "INSERT INTO reviews (product_id, order_code, name, rating, body) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      productId,
      code,
      String(body?.name ?? "").trim().slice(0, 40),
      rating,
      String(body?.body ?? "").trim().slice(0, 600)
    );

  return NextResponse.json({ ok: true });
}
