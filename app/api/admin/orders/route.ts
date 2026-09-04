import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { sendShippedNotice, emailReady } from "@/lib/email";

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

  const order = db
    .prepare("SELECT items_json, stock_restored FROM orders WHERE id = ?")
    .get(id) as { items_json: string; stock_restored: number } | undefined;
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  const giveBack = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");

  db.transaction(() => {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(body.status, id);

    // الإلغاء يعيد الكميات مرة واحدة — الحارس يمنع مضاعفتها لو أُلغي الطلب مرتين
    if (body.status === "cancelled" && order.stock_restored === 0) {
      try {
        const items = JSON.parse(order.items_json) as { id: number; qty: number }[];
        for (const it of items) giveBack.run(Number(it.qty) || 0, Number(it.id));
      } catch {
        /* سطر تالف في الطلب لا يمنع تغيير الحالة */
      }
      db.prepare("UPDATE orders SET stock_restored = 1 WHERE id = ?").run(id);
    }
  })();

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
