import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const reviews = getDb()
    .prepare(
      `SELECT r.*, p.name AS product_name FROM reviews r
       LEFT JOIN products p ON p.id = r.product_id
       ORDER BY r.approved ASC, r.id DESC`
    )
    .all();
  return NextResponse.json({ reviews });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  getDb()
    .prepare("UPDATE reviews SET approved = ? WHERE id = ?")
    .run(body.approved ? 1 : 0, Number(body.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  getDb().prepare("DELETE FROM reviews WHERE id = ?").run(Number(body.id));
  return NextResponse.json({ ok: true });
}
