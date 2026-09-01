import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PAYMENT_LIVE } from "@/lib/site";

/**
 * محاكاة إتمام الدفع (وضع تجريبي).
 * عند الربط مع بوابة دفع حقيقية (Moyasar / Tap):
 * ستستبدل هذه النقطة بـ webhook يستقبل تأكيد الدفع من البوابة
 * ويُحدّث حالة الطلب بعد التحقق من التوقيع.
 */
export async function POST(request: Request) {
  // حارس: بلا بوابة حقيقية لا يجوز تعليم أي طلب مدفوعًا
  if (!PAYMENT_LIVE)
    return NextResponse.json(
      { error: "الدفع الإلكتروني غير مفعّل حاليًا — التأكيد يتم عبر واتساب" },
      { status: 503 }
    );

  try {
    const { code, method } = (await request.json()) as { code: string; method: string };
    if (!code) return NextResponse.json({ error: "رمز الطلب مفقود" }, { status: 400 });

    const db = getDb();

    if (code.startsWith("ORD-")) {
      const order = db.prepare("SELECT id, status FROM orders WHERE code = ?").get(code) as
        | { id: number; status: string }
        | undefined;
      if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
      if (order.status !== "pending_payment")
        return NextResponse.json({ error: "هذا الطلب ليس بانتظار الدفع" }, { status: 400 });
      db.prepare("UPDATE orders SET status = 'paid', payment_method = ? WHERE id = ?").run(
        method ?? "", order.id
      );
      return NextResponse.json({ ok: true });
    }

    if (code.startsWith("CST-")) {
      const req = db.prepare("SELECT id, status FROM custom_requests WHERE code = ?").get(code) as
        | { id: number; status: string }
        | undefined;
      if (!req) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
      if (req.status !== "approved")
        return NextResponse.json({ error: "هذا الطلب ليس بانتظار الدفع" }, { status: 400 });
      db.prepare("UPDATE custom_requests SET status = 'paid', payment_method = ? WHERE id = ?").run(
        method ?? "", req.id
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "رمز غير صالح" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
