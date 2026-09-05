import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { normalizeCode } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const coupons = getDb()
    .prepare("SELECT * FROM coupons ORDER BY created_at DESC")
    .all();
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const code = normalizeCode(body.code);
  if (!/^[A-Z0-9_-]{3,24}$/.test(code))
    return NextResponse.json(
      { error: "الرمز: 3–24 حرفًا إنجليزيًا أو رقمًا" },
      { status: 400 }
    );

  const kind = body.kind === "fixed" ? "fixed" : "percent";
  const value = Number(body.value);
  if (!Number.isFinite(value) || value <= 0)
    return NextResponse.json({ error: "قيمة الخصم مطلوبة" }, { status: 400 });
  if (kind === "percent" && value > 100)
    return NextResponse.json({ error: "النسبة لا تتجاوز 100%" }, { status: 400 });

  try {
    getDb()
      .prepare(
        `INSERT INTO coupons (code, kind, value, min_total, max_uses, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        code,
        kind,
        value,
        Math.max(0, Number(body.min_total) || 0),
        Math.max(0, Math.floor(Number(body.max_uses) || 0)),
        String(body.expires_at ?? "").trim().slice(0, 10)
      );
  } catch {
    return NextResponse.json({ error: "هذا الرمز موجود مسبقًا" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  const code = normalizeCode(body.code);
  getDb()
    .prepare("UPDATE coupons SET active = ? WHERE code = ?")
    .run(body.active ? 1 : 0, code);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  getDb().prepare("DELETE FROM coupons WHERE code = ?").run(normalizeCode(body.code));
  return NextResponse.json({ ok: true });
}
