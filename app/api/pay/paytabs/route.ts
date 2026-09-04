import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { paytabsReady, createPaymentPage, saveTranRef } from "@/lib/paytabs";
import { originOf } from "@/lib/auth";

type OrderRow = {
  code: string;
  customer_name: string;
  phone: string;
  city: string;
  total: number;
  status: string;
};

/** يبدأ الدفع بالبطاقة: ينشئ صفحة PayTabs ويعيد رابطها للمتصفح */
export async function POST(request: Request) {
  if (!paytabsReady())
    return NextResponse.json({ error: "الدفع بالبطاقة غير مفعّل" }, { status: 503 });

  const body = await request.json().catch(() => null);
  const code = String(body?.code ?? "");

  // الطلبات المخصصة لها مسار مختلف وهي معطّلة حاليًا
  if (!code.startsWith("ORD-"))
    return NextResponse.json({ error: "رمز طلب غير صالح" }, { status: 400 });

  const order = getDb()
    .prepare("SELECT code, customer_name, phone, city, total, status FROM orders WHERE code = ?")
    .get(code) as OrderRow | undefined;

  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  if (order.status !== "pending_payment")
    return NextResponse.json({ error: "هذا الطلب ليس بانتظار الدفع" }, { status: 400 });

  const origin = originOf(request);
  const page = await createPaymentPage({
    code: order.code,
    amount: order.total,
    description: `طلب ${order.code} — M3DStore`,
    customerName: order.customer_name,
    phone: order.phone,
    city: order.city,
    returnUrl: `${origin}/api/pay/paytabs/return?code=${encodeURIComponent(order.code)}`,
    callbackUrl: `${origin}/api/pay/paytabs/callback`,
  });

  if (!page)
    return NextResponse.json(
      { error: "تعذّر فتح صفحة الدفع. جرّب مرة ثانية أو حوّل بنكيًا." },
      { status: 502 }
    );

  saveTranRef(order.code, page.tranRef);
  return NextResponse.json({ redirect_url: page.redirectUrl });
}
