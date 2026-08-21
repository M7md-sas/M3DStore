import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

const ALLOWED = ["review", "approved", "paid", "printing", "shipped", "delivered", "rejected"];

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = (await request.json()) as {
    id: number;
    status: string;
    price?: number;
    admin_note?: string;
  };
  if (!body.id || !ALLOWED.includes(body.status))
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  if (body.status === "approved") {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0)
      return NextResponse.json({ error: "حدد سعرًا صحيحًا قبل القبول" }, { status: 400 });
  }

  const db = getDb();
  const info = db
    .prepare(
      "UPDATE custom_requests SET status = ?, price = COALESCE(?, price), admin_note = COALESCE(?, admin_note) WHERE id = ?"
    )
    .run(
      body.status,
      body.price != null ? Number(body.price) : null,
      body.admin_note != null ? String(body.admin_note) : null,
      Number(body.id)
    );
  if (info.changes === 0) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
