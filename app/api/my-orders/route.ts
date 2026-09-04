import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { currentUser, googleAuthReady } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Row = { code: string; created_at: string; status: string; total: number };

/**
 * طلبات صاحب الحساب من الخادم — هذه هي الميزة التي لا يقدمها التخزين
 * المحلي: تظهر على أي جهاز يسجّل فيه بنفس حساب قوقل.
 */
export async function GET() {
  // enabled يخبر الواجهة هل تعرض زر الدخول أصلًا — بلا مفاتيح، لا زر
  const enabled = googleAuthReady();
  const user = await currentUser();
  if (!user) return NextResponse.json({ enabled, user: null, orders: [] });

  const orders = getDb()
    .prepare(
      "SELECT code, created_at, status, total FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50"
    )
    .all(user.id) as Row[];

  return NextResponse.json({
    enabled,
    user: { name: user.name, email: user.email },
    orders,
  });
}

/**
 * ربط طلبات اشتُريت كضيف بالحساب بعد الدخول.
 * الرمز نفسه يفتح الطلب في صفحة التتبع أصلًا، فمن يملكه يملك الوصول —
 * ولا نلمس طلبًا ارتبط بحساب آخر، فلا يُنتزع طلب من صاحبه.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, linked: 0 });

  const body = await request.json().catch(() => null);
  const codes = Array.isArray(body?.codes)
    ? body.codes.filter((c: unknown): c is string => typeof c === "string").slice(0, 50)
    : [];
  if (codes.length === 0) return NextResponse.json({ ok: true, linked: 0 });

  const db = getDb();
  const link = db.prepare("UPDATE orders SET user_id = ? WHERE code = ? AND user_id IS NULL");
  const linkAll = db.transaction((list: string[]) => {
    let n = 0;
    for (const code of list) n += link.run(user.id, code).changes;
    return n;
  });

  return NextResponse.json({ ok: true, linked: linkAll(codes) });
}
