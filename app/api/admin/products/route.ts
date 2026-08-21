import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { isValidImagePath, fallbackImage } from "@/lib/images";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const category = String(body.category ?? "").trim();
  if (!name || !Number.isFinite(price) || price <= 0 || !category)
    return NextResponse.json({ error: "الاسم والسعر والفئة مطلوبة" }, { status: 400 });

  const image = isValidImagePath(body.image) ? body.image : fallbackImage();
  const db = getDb();
  const info = db
    .prepare(
      "INSERT INTO products (name, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      name,
      String(body.description ?? "").trim(),
      price,
      category,
      image,
      Math.max(0, Math.floor(Number(body.stock) || 0))
    );
  return NextResponse.json({ id: info.lastInsertRowid });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "معرف مفقود" }, { status: 400 });

  const db = getDb();
  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

  if (typeof body.active === "number" || typeof body.active === "boolean") {
    db.prepare("UPDATE products SET active = ? WHERE id = ?").run(body.active ? 1 : 0, id);
  }
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    const price = Number(body.price);
    if (!name || !Number.isFinite(price) || price <= 0)
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    const fields = [name, String(body.description ?? "").trim(), price, String(body.category ?? "").trim(), Math.max(0, Math.floor(Number(body.stock) || 0))];

    if (isValidImagePath(body.image)) {
      db.prepare(
        "UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image = ? WHERE id = ?"
      ).run(...fields, body.image, id);
    } else {
      db.prepare(
        "UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ? WHERE id = ?"
      ).run(...fields, id);
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = (await request.json()) as { id: number };
  if (!id) return NextResponse.json({ error: "معرف مفقود" }, { status: 400 });
  const db = getDb();
  // إخفاء بدل الحذف النهائي حتى لا تنكسر الطلبات القديمة
  db.prepare("UPDATE products SET active = 0 WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
