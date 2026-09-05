import { NextResponse } from "next/server";
import { checkCoupon } from "@/lib/coupons";

/** فحص كوبون لعرض خصمه في صفحة الدفع — الحساب النهائي يُعاد عند إنشاء الطلب */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const subtotal = Number(body?.subtotal);
  if (!Number.isFinite(subtotal) || subtotal <= 0)
    return NextResponse.json({ ok: false, error: "السلة فاضية" }, { status: 400 });

  const result = checkCoupon(body?.code, subtotal);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
