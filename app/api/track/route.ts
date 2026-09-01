import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code: string };
    const trimmed = (code ?? "").trim().toUpperCase();
    if (!trimmed) return NextResponse.json({ error: "اكتب رمز التتبع" }, { status: 400 });

    const db = getDb();

    if (trimmed.startsWith("ORD-")) {
      const order = db
        .prepare("SELECT code, status, total, items_json, city, created_at, carrier, tracking FROM orders WHERE code = ?")
        .get(trimmed) as
        | {
            code: string;
            status: string;
            total: number;
            items_json: string;
            city: string;
            created_at: string;
            carrier: string;
            tracking: string;
          }
        | undefined;
      if (!order) return NextResponse.json({ error: "ما لقينا طلب بهذا الرمز" }, { status: 404 });
      return NextResponse.json({
        type: "order",
        code: order.code,
        status: order.status,
        total: order.total,
        city: order.city,
        created_at: order.created_at,
        carrier: order.carrier,
        tracking: order.tracking,
        items: JSON.parse(order.items_json),
      });
    }

    if (trimmed.startsWith("CST-")) {
      const req = db
        .prepare("SELECT code, status, price, admin_note, created_at FROM custom_requests WHERE code = ?")
        .get(trimmed) as
        | { code: string; status: string; price: number | null; admin_note: string; created_at: string }
        | undefined;
      if (!req) return NextResponse.json({ error: "ما لقينا طلب بهذا الرمز" }, { status: 404 });
      return NextResponse.json({
        type: "custom",
        code: req.code,
        status: req.status,
        price: req.price,
        admin_note: req.admin_note,
        created_at: req.created_at,
      });
    }

    return NextResponse.json(
      { error: "الرمز يبدأ بـ ORD- للطلبات أو CST- للتصاميم المخصصة" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
