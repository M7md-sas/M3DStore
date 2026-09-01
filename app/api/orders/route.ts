import { NextResponse } from "next/server";
import { getDb, generateCode } from "@/lib/db";
import { shippingFor } from "@/lib/shipping";
import { validateSelection } from "@/lib/colors";

type ItemInput = { id: number; qty: number; colors?: string[] };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, phone, city, address, payment_method, items, notes } = body as {
      customer_name: string;
      phone: string;
      city: string;
      address: string;
      payment_method: string;
      items: ItemInput[];
      notes?: string;
    };

    if (!customer_name?.trim() || !phone?.trim() || !city?.trim())
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    if (!/^05\d{8}$/.test(phone.trim()))
      return NextResponse.json({ error: "رقم الجوال غير صحيح" }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: "السلة فاضية" }, { status: 400 });

    const db = getDb();
    const getProduct = db.prepare("SELECT * FROM products WHERE id = ? AND active = 1");

    const lineItems: {
      id: number;
      name: string;
      price: number;
      qty: number;
      colors?: string[];
    }[] = [];
    for (const item of items) {
      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 0)));
      const p = getProduct.get(Number(item.id)) as
        | {
            id: number;
            name: string;
            price: number;
            stock: number;
            colors: string;
            color_mode: string;
          }
        | undefined;
      if (!p) return NextResponse.json({ error: "أحد المنتجات لم يعد متوفرًا" }, { status: 400 });

      // الألوان تُتحقق في الخادم — لا نثق بما يرسله المتصفح
      const check = validateSelection(p.colors, p.color_mode, item.colors);
      if (!check.ok)
        return NextResponse.json(
          { error: `${check.error} لمنتج «${p.name}»` },
          { status: 400 }
        );

      lineItems.push({
        id: p.id,
        name: p.name,
        price: p.price,
        qty,
        ...(check.colors.length ? { colors: check.colors } : {}),
      });
    }

    const subtotal = lineItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = shippingFor(subtotal);
    const total = subtotal + shipping;
    const code = generateCode("ORD");

    const insertOrder = db.prepare(
      `INSERT INTO orders (code, customer_name, phone, city, address, items_json, subtotal, shipping, total, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    // الشرط داخل الجملة نفسها: طلبان متزامنان على آخر قطعة لا يمكن أن ينجحا معًا
    const takeStock = db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?"
    );

    // الخصم والإنشاء في معاملة واحدة — لا مخزون يُخصم لطلب لم يُنشأ، ولا عكس
    const place = db.transaction(() => {
      for (const item of lineItems) {
        if (takeStock.run(item.qty, item.id, item.qty).changes === 0) {
          const left = (
            db.prepare("SELECT stock FROM products WHERE id = ?").get(item.id) as
              | { stock: number }
              | undefined
          )?.stock;
          throw new Error(
            left && left > 0
              ? `المتوفر من «${item.name}» ${left} فقط`
              : `نفدت الكمية من «${item.name}»`
          );
        }
      }

      insertOrder.run(
        code,
        customer_name.trim(),
        phone.trim(),
        city.trim(),
        (address ?? "").trim(),
        JSON.stringify(lineItems),
        subtotal,
        shipping,
        total,
        payment_method ?? "",
        String(notes ?? "").trim().slice(0, 1000)
      );
    });

    try {
      place();
    } catch (err) {
      // رسالة المخزون تخص الزبون؛ أي خطأ آخر يسقط للمعالج العام
      const message = err instanceof Error ? err.message : "";
      if (message.includes("«")) return NextResponse.json({ error: message }, { status: 409 });
      throw err;
    }

    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
