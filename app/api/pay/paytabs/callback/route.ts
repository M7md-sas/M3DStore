import { NextResponse } from "next/server";
import { paytabsReady, settleOrder } from "@/lib/paytabs";

/**
 * إشعار PayTabs من خادم إلى خادم — وهو الطريق الموثوق لتأكيد الدفع
 * لأنه لا يمر بجهاز الزبون. مع ذلك لا نصدّق جسمه: نأخذ منه رمز الطلب
 * فقط، ثم نسأل PayTabs بأنفسنا في settleOrder.
 */
export async function POST(request: Request) {
  if (!paytabsReady()) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await request.json().catch(() => null);
  const code = String(body?.cart_id ?? "");
  if (!code.startsWith("ORD-")) return NextResponse.json({ ok: false }, { status: 400 });

  await settleOrder(code);

  // نرد بنجاح دائمًا حتى لا تعيد البوابة الإرسال بلا نهاية على حالة نعرفها
  return NextResponse.json({ ok: true });
}
