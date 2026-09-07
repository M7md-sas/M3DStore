import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { isAdmin } from "@/lib/admin-auth";
import { dataDir, closeDb, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const backupDir = path.join(dataDir, "backups");

function integrityOf(file: string): string {
  const db = new Database(file, { readonly: true });
  try {
    const rows = db.pragma("integrity_check") as { integrity_check: string }[];
    return rows[0]?.integrity_check ?? "unknown";
  } finally {
    db.close();
  }
}

/**
 * استعادة قاعدة البيانات من نسخة احتياطية.
 *
 * نظام نسخ بلا زر استعادة نصف نظام: النسخة لا تنفع إن لم تُرجَع.
 * وثلاثة حرّاس تمنع أن تكون الاستعادة نفسها كارثة:
 *   1. لا نستعيد نسخة تالفة — نفحص سلامتها قبل لمس أي شيء.
 *   2. نحفظ الحالة الراهنة أولًا، فالتراجع ممكن دائمًا.
 *   3. نغلق الاتصال قبل الاستبدال — استبدال ملف مفتوح يفسده.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = path.basename(String(body?.name ?? ""));
  if (!/^store-[\d-]+\.db$/.test(name))
    return NextResponse.json({ error: "اسم نسخة غير صالح" }, { status: 400 });

  const source = path.join(backupDir, name);
  if (!fs.existsSync(source))
    return NextResponse.json({ error: "النسخة غير موجودة" }, { status: 404 });

  // ١) لا نستعيد عطبًا فوق عطب
  let check: string;
  try {
    check = integrityOf(source);
  } catch {
    return NextResponse.json({ error: "تعذّر فحص النسخة" }, { status: 500 });
  }
  if (check !== "ok")
    return NextResponse.json(
      { error: `هذه النسخة نفسها تالفة (${check.slice(0, 80)}) — اختر غيرها` },
      { status: 409 }
    );

  const live = path.join(dataDir, "store.db");
  const stamp = new Date(Date.now() + 3 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[:T]/g, "-")
    .slice(0, 16);
  const rollback = path.join(backupDir, `before-restore-${stamp}.db`);

  try {
    // ٢) لقطة للحالة الراهنة قبل استبدالها
    fs.copyFileSync(live, rollback);

    // ٣) إغلاق الاتصال، ثم الاستبدال، ثم إزالة ملفات WAL القديمة
    closeDb();
    fs.copyFileSync(source, live);
    for (const ext of ["-wal", "-shm"]) {
      const f = live + ext;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }

    // getDb يعيد الفتح تلقائيًا ويشغّل الترحيلات على الملف المستعاد
    const db = getDb();
    const after = (db.pragma("integrity_check") as { integrity_check: string }[])[0]
      ?.integrity_check;
    const products = (db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number }).n;
    const orders = (db.prepare("SELECT COUNT(*) AS n FROM orders").get() as { n: number }).n;

    return NextResponse.json({
      ok: true,
      restored: name,
      rollback: path.basename(rollback),
      integrity: after,
      products,
      orders,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `فشلت الاستعادة: ${e instanceof Error ? e.message : "خطأ"}` },
      { status: 500 }
    );
  }
}
