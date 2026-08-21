import { NextResponse } from "next/server";
import { getDb, generateCode } from "@/lib/db";
import { shippingFor } from "@/lib/shipping";

type ItemInput = { id: number; qty: number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, phone, city, address, payment_method, items } = body as {
      customer_name: string;
      phone: string;
      city: string;
      address: string;
      payment_method: string;
      items: ItemInput[];
    };

    if (!customer_name?.trim() || !phone?.trim() || !city?.trim())
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    if (!/^05\d{8}$/.test(phone.trim()))
      return NextResponse.json({ error: "رقم الجوال غير صحيح" }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: "السلة فاضية" }, { status: 400 });

    const db = getDb();
    const getProduct = db.prepare("SELECT * FROM products WHERE id = ? AND active = 1");

    const lineItems: { id: number; name: string; price: number; qty: number }[] = [];
    for (const item of items) {
      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 0)));
      const p = getProduct.get(Number(item.id)) as
        | { id: number; name: string; price: number; stock: number }
        | undefined;
      if (!p) return NextResponse.json({ error: "أحد المنتجات لم يعد متوفرًا" }, { status: 400 });
      lineItems.push({ id: p.id, name: p.name, price: p.price, qty });
    }

    const subtotal = lineItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = shippingFor(subtotal);
    const total = subtotal + shipping;
    const code = generateCode("ORD");

    db.prepare(
      `INSERT INTO orders (code, customer_name, phone, city, address, items_json, subtotal, shipping, total, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      code,
      customer_name.trim(),
      phone.trim(),
      city.trim(),
      (address ?? "").trim(),
      JSON.stringify(lineItems),
      subtotal,
      shipping,
      total,
      payment_method ?? ""
    );

    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
