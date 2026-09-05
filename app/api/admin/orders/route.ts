import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { sendShippedNotice, emailReady } from "@/lib/email";
import { cancelAndRestore } from "@/lib/orders";

const ALLOWED = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"];

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = (await request.json()) as {
    id: number;
    status?: string;
    carrier?: string;
    tracking?: string;
  };
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "معرف مفقود" }, { status: 400 });

  const db = getDb();

  // تحديث بيانات الشحنة وحدها، بلا تغيير الحالة
  if (body.carrier !== undefined || body.tracking !== undefined) {
    const info = db
      .prepare("UPDATE orders SET carrier = ?, tracking = ? WHERE id = ?")
      .run(
        String(body.carrier ?? "").trim().slice(0, 40),
        String(body.tracking ?? "").trim().slice(0, 60),
        id
      );
    if (info.changes === 0)
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (!body.status || !ALLOWED.includes(body.status))
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const exists = db.prepare("SELECT id FROM orders WHERE id = ?").get(id);
  if (!exists) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  // الإلغاء يمر بالدالة المشتركة نفسها التي يستخدمها إلغاء الزبون،
  // فلا يفترق السلوكان ولا تتضاعف الكميات
  if (body.status === "cancelled") {
    cancelAndRestore(id);
  } else {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(body.status, id);
  }

  // إشعار الشحن يُرسل مرة واحدة عند الانتقال إلى «تم الشحن»، وبعد نجاح
  // التحديث. فشله لا يُرجع خطأ — الحالة تغيّرت فعلًا.
  if (body.status === "shipped" && emailReady()) {
    const row = db
      .prepare("SELECT code, email, customer_name, carrier, tracking FROM orders WHERE id = ?")
      .get(id) as
      | { code: string; email: string; customer_name: string; carrier: string; tracking: string }
      | undefined;
    if (row?.email) void sendShippedNotice(row);
  }

  return NextResponse.json({ ok: true });
}
