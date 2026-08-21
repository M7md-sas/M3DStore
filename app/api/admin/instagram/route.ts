import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { isValidImagePath, serializeImages } from "@/lib/images";
import { serializeColors, parseColorMode } from "@/lib/colors";

type Row = { product_id: number | null; active: number | null };

function postProduct(postId: number): Row | null {
  const row = getDb()
    .prepare(
      `SELECT i.product_id, p.active
       FROM instagram_posts i
       LEFT JOIN products p ON p.id = i.product_id
       WHERE i.id = ?`
    )
    .get(postId) as Row | undefined;
  return row?.product_id ? row : null;
}

/**
 * حفظ منتج مستورد، ونشره اختياريًا.
 *
 * - publish = true  → يتطلب سعرًا أكبر من صفر، ويفعّل المنتج في المتجر.
 * - publish = false → حفظ فقط بدون أي شرط سعر، وحالة العرض تبقى كما هي.
 *   (هذا يسمح بتعديل الصورة أو النص أو الاسم قبل تحديد السعر، وبتعديل
 *    منتج منشور دون أن يختفي من المتجر.)
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const postId = Number(body.id);
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const category = String(body.category ?? "").trim();
  const publish = body.publish === true;

  if (!postId) return NextResponse.json({ error: "معرف مفقود" }, { status: 400 });

  const row = postProduct(postId);
  if (!row) return NextResponse.json({ error: "المنتج المستورد غير موجود" }, { status: 404 });

  if (!name) return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
  if (!category) return NextResponse.json({ error: "الفئة مطلوبة" }, { status: 400 });
  if (publish && (!Number.isFinite(price) || price <= 0))
    return NextResponse.json({ error: "حدّد سعرًا أكبر من صفر قبل النشر" }, { status: 400 });

  const fields = [
    name,
    String(body.description ?? "").trim(),
    Number.isFinite(price) && price > 0 ? price : 0,
    category,
    Math.max(0, Math.floor(Number(body.stock) || 0)),
    serializeColors(body.colors),
    parseColorMode(body.color_mode),
  ];

  const db = getDb();
  const image = isValidImagePath(body.image) ? body.image : null;

  // active لا يُمس إلا عند النشر الصريح، حتى لا يختفي منتج منشور بمجرد حفظ تعديل
  const sql = `UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, colors = ?, color_mode = ?, images = ?${
    image ? ", image = ?" : ""
  }${publish ? ", active = 1" : ""} WHERE id = ?`;

  db.prepare(sql).run(
    ...fields,
    serializeImages(body.images, image ?? ""),
    ...(image ? [image] : []),
    row.product_id
  );

  return NextResponse.json({
    ok: true,
    productId: row.product_id,
    active: publish ? 1 : (row.active ?? 0),
  });
}

/** إظهار أو إخفاء منتج مستورد من المتجر بدون حذفه */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const postId = Number(body.id);
  if (!postId) return NextResponse.json({ error: "معرف مفقود" }, { status: 400 });

  const row = postProduct(postId);
  if (!row) return NextResponse.json({ error: "المنتج المستورد غير موجود" }, { status: 404 });

  const db = getDb();

  if (body.active) {
    const product = db
      .prepare("SELECT price FROM products WHERE id = ?")
      .get(row.product_id) as { price: number } | undefined;
    if (!product || product.price <= 0)
      return NextResponse.json(
        { error: "لا يمكن عرض منتج بسعر صفر — حدّد السعر أولًا" },
        { status: 400 }
      );
  }

  db.prepare("UPDATE products SET active = ? WHERE id = ?").run(
    body.active ? 1 : 0,
    row.product_id
  );

  return NextResponse.json({ ok: true, productId: row.product_id });
}
