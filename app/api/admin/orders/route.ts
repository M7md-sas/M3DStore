import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

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

  const info = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(body.status, id);
  if (info.changes === 0) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
