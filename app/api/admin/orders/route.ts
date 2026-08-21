import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

const ALLOWED = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"];

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id, status } = (await request.json()) as { id: number; status: string };
  if (!id || !ALLOWED.includes(status))
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const db = getDb();
  const info = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, Number(id));
  if (info.changes === 0) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
