import { NextResponse } from "next/server";
import { checkCoupon } from "@/lib/coupons";
import { allow, clientIp } from "@/lib/rate-limit";

/** فحص كوبون لعرض خصمه في صفحة الدفع — الحساب النهائي يُعاد عند إنشاء الطلب */
export async function POST(request: Request) {
  if (!allow(`coupon:${clientIp(request.headers)}`, 20, 60 * 1000))
    return NextResponse.json({ ok: false, error: "محاولات كثيرة" }, { status: 429 });

  const body = await request.json().catch(() => null);
  const subtotal = Number(body?.subtotal);
  if (!Number.isFinite(subtotal) || subtotal <= 0)
    return NextResponse.json({ ok: false, error: "السلة فاضية" }, { status: 400 });

  const result = checkCoupon(body?.code, subtotal);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
