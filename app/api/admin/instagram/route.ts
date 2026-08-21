import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

type Row = { product_id: number | null };

function postProduct(postId: number): number | null {
  const row = getDb()
    .prepare("SELECT product_id FROM instagram_posts WHERE id = ?")
    .get(postId) as Row | undefined;
  return row?.product_id ?? null;
}

/**
 * نشر منتج مستورد: يحفظ البيانات ويفعّله في المتجر بعملية واحدة.
 * التفعيل لا يحدث إلا بعد اجتياز التحقق، حتى لا يظهر منتج بسعر صفر للبيع.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const postId = Number(body.id);
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const category = String(body.category ?? "").trim();
  const publish = body.publish !== false;

  if (!postId) return NextResponse.json({ error: "معرف مفقود" }, { status: 400 });

  const productId = postProduct(postId);
  if (!productId)
    return NextResponse.json({ error: "المنتج المستورد غير موجود" }, { status: 404 });

  if (!name) return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
  if (!category) return NextResponse.json({ error: "الفئة مطلوبة" }, { status: 400 });
  if (publish && (!Number.isFinite(price) || price <= 0))
    return NextResponse.json(
      { error: "حدّد سعرًا أكبر من صفر قبل النشر" },
      { status: 400 }
    );

  // الصورة تأتي من سكربت الاستيراد ولا تُغيَّر من هنا — تُعدّل من تبويب المنتجات
  getDb()
    .prepare(
      `UPDATE products
       SET name = ?, description = ?, price = ?, category = ?, stock = ?, active = ?
       WHERE id = ?`
    )
    .run(
      name,
      String(body.description ?? "").trim(),
      Number.isFinite(price) && price > 0 ? price : 0,
      category,
      Math.max(0, Math.floor(Number(body.stock) || 0)),
      publish ? 1 : 0,
      productId
    );

  return NextResponse.json({ ok: true, productId, active: publish ? 1 : 0 });
}

/** إخفاء منتج مستورد من المتجر بدون حذفه */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const postId = Number(body.id);
  if (!postId) return NextResponse.json({ error: "معرف مفقود" }, { status: 400 });

  const productId = postProduct(postId);
  if (!productId)
    return NextResponse.json({ error: "المنتج المستورد غير موجود" }, { status: 404 });

  getDb()
    .prepare("UPDATE products SET active = ? WHERE id = ?")
    .run(body.active ? 1 : 0, productId);

  return NextResponse.json({ ok: true, productId });
}
