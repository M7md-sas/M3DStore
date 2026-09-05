import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cancelAndRestore } from "@/lib/orders";

/**
 * إلغاء الزبون لطلبه بنفسه.
 *
 * الرمز هو المفتاح، كما في التتبع والفاتورة. ولا يُلغى إلا طلب ما زال
 * «بانتظار الدفع»: بعد الدفع أو الشحن يصير الإلغاء قرار صاحب المتجر
 * لا الزبون، فيبقى على واتساب.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = String(body?.code ?? "").trim();
  if (!code.startsWith("ORD-"))
    return NextResponse.json({ error: "رمز غير صالح" }, { status: 400 });

  const order = getDb()
    .prepare("SELECT id, status FROM orders WHERE code = ?")
    .get(code) as { id: number; status: string } | undefined;

  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  if (order.status === "cancelled")
    return NextResponse.json({ ok: true, already: true });

  if (order.status !== "pending_payment")
    return NextResponse.json(
      { error: "الطلب دخل التجهيز — كلّمنا واتساب وبنساعدك" },
      { status: 409 }
    );

  cancelAndRestore(order.id);
  return NextResponse.json({ ok: true });
}
